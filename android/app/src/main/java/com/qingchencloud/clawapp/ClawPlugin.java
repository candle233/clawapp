package com.qingchencloud.clawapp;

import android.Manifest;
import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * ClawPlugin — Capacitor 插件
 *
 * 提供给 H5 的方法:
 *   startService(options)  — 启动前台常驻服务
 *   stopService()          — 停止服务
 *   isServiceRunning()     — 查询运行状态
 *   setOptions(options)    — 动态更新选项（不重启服务）
 *
 * 推送给 H5 的事件:
 *   wakeWord               — 检测到唤醒词后触发
 *   serviceState           — 服务状态变更通知
 */
@CapacitorPlugin(
    name = "Claw",
    permissions = {
        @Permission(strings = {Manifest.permission.RECORD_AUDIO},    alias = "microphone"),
        @Permission(strings = {Manifest.permission.POST_NOTIFICATIONS}, alias = "notifications"),
    }
)
public class ClawPlugin extends Plugin {

    private static final String TAG = "ClawPlugin";

    // 单例引用，供 Service 回调时使用
    static ClawPlugin instance;

    private ServiceConnection serviceConnection;
    private ClawForegroundService boundService;

    @Override
    public void load() {
        instance = this;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 插件方法
    // ──────────────────────────────────────────────────────────────────────────

    @PluginMethod
    public void startService(PluginCall call) {
        boolean wakeWordEnabled = call.getBoolean("wakeWordEnabled", true);
        boolean autoTts         = call.getBoolean("autoTts", true);

        // 先请求运行时权限
        if (!hasRequiredPermissions()) {
            requestPermissionForAliases(new String[]{"microphone", "notifications"}, call, "permissionsCallback");
            return;
        }

        doStartService(call, wakeWordEnabled, autoTts);
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        if (getPermissionState("microphone") != com.getcapacitor.PermissionState.GRANTED) {
            call.reject("microphone_denied");
            return;
        }
        boolean wakeWordEnabled = call.getBoolean("wakeWordEnabled", true);
        boolean autoTts         = call.getBoolean("autoTts", true);
        doStartService(call, wakeWordEnabled, autoTts);
    }

    private void doStartService(PluginCall call, boolean wakeWordEnabled, boolean autoTts) {
        Context ctx = getContext();
        Intent intent = new Intent(ctx, ClawForegroundService.class);
        intent.putExtra(ClawForegroundService.EXTRA_WAKE_WORD_ENABLED, wakeWordEnabled);
        intent.putExtra(ClawForegroundService.EXTRA_AUTO_TTS, autoTts);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ctx.startForegroundService(intent);
        } else {
            ctx.startService(intent);
        }

        bindToService(ctx);
        call.resolve();
    }

    @PluginMethod
    public void stopService(PluginCall call) {
        Context ctx = getContext();
        unbindFromService(ctx);
        ctx.stopService(new Intent(ctx, ClawForegroundService.class));
        call.resolve();
    }

    @PluginMethod
    public void isServiceRunning(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("running", ClawForegroundService.isRunning());
        call.resolve(ret);
    }

    @PluginMethod
    public void setOptions(PluginCall call) {
        if (boundService != null) {
            if (call.hasOption("wakeWordEnabled")) {
                boundService.setWakeWordEnabled(call.getBoolean("wakeWordEnabled", true));
            }
        }
        call.resolve();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Service 绑定
    // ──────────────────────────────────────────────────────────────────────────

    private void bindToService(Context ctx) {
        serviceConnection = new ServiceConnection() {
            @Override
            public void onServiceConnected(ComponentName name, IBinder binder) {
                ClawForegroundService.LocalBinder lb = (ClawForegroundService.LocalBinder) binder;
                boundService = lb.getService();
                Log.d(TAG, "Service bound");
            }
            @Override
            public void onServiceDisconnected(ComponentName name) {
                boundService = null;
                Log.d(TAG, "Service unbound");
            }
        };
        ctx.bindService(new Intent(ctx, ClawForegroundService.class), serviceConnection, Context.BIND_AUTO_CREATE);
    }

    private void unbindFromService(Context ctx) {
        if (serviceConnection != null) {
            try { ctx.unbindService(serviceConnection); } catch (Exception ignored) {}
            serviceConnection = null;
            boundService = null;
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 事件推送（由 Service 调用）
    // ──────────────────────────────────────────────────────────────────────────

    /** Service 检测到唤醒词后调用此方法，触发 JS 事件 */
    void onWakeWord() {
        JSObject data = new JSObject();
        data.put("word", "Claw Claw");
        notifyListeners("wakeWord", data);
        Log.d(TAG, "wakeWord event fired");
    }

    /** 服务状态变更 */
    void onServiceState(boolean running) {
        JSObject data = new JSObject();
        data.put("running", running);
        notifyListeners("serviceState", data);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 工具
    // ──────────────────────────────────────────────────────────────────────────

    private boolean hasRequiredPermissions() {
        return getPermissionState("microphone") == com.getcapacitor.PermissionState.GRANTED;
    }
}

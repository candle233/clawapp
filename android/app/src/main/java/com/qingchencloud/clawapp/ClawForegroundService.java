package com.qingchencloud.clawapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import java.util.ArrayList;
import java.util.Locale;

/**
 * ClawForegroundService — 前台常驻服务
 *
 * 功能：
 * 1. 显示前台持久通知，防止系统在后台杀死 App
 * 2. 持续运行唤醒词循环（使用系统 SpeechRecognizer）
 * 3. 检测到 "Claw Claw" / "爪爪" 后通知 ClawPlugin，再由插件推送 JS 事件
 *
 * 限制说明：
 * - SpeechRecognizer 需要在主线程创建，服务通过 Handler(main looper) 操作它
 * - Android 的系统 STT 在屏幕完全关闭后可能被系统节流；WAKE_LOCK 可延迟此行为
 * - targetSdk ≥ 34 时需要在 Manifest 中声明 foregroundServiceType="microphone"
 */
public class ClawForegroundService extends Service {

    private static final String TAG                = "ClawService";
    static final String CHANNEL_ID                 = "clawapp_persistent";
    static final String EXTRA_WAKE_WORD_ENABLED    = "wakeWordEnabled";
    static final String EXTRA_AUTO_TTS             = "autoTts";
    private static final int    NOTIFICATION_ID    = 1001;

    // 唤醒词列表（小写，用于 contains 检测）
    // "claw, claw" 含逗号是部分 STT 引擎对两个独立词的分词输出形式
    private static final String[] WAKE_WORDS = {
        "claw claw", "clawclaw", "爪爪", "抓抓", "claw, claw"
    };

    // 唤醒词检测后恢复监听的延迟（毫秒），给 H5 语音输入留出足够时间
    private static final long WAKE_WORD_RESUME_DELAY_MS = 5000;

    private final IBinder binder = new LocalBinder();

    private Handler        mainHandler;
    private SpeechRecognizer speechRecognizer;
    private volatile boolean wakeWordEnabled = true;
    private volatile boolean loopRunning     = false;

    // ──────────────────────────────────────────────────────────────────────────
    // Binder
    // ──────────────────────────────────────────────────────────────────────────

    public class LocalBinder extends Binder {
        ClawForegroundService getService() { return ClawForegroundService.this; }
    }

    @Override
    public IBinder onBind(Intent intent) { return binder; }

    // ──────────────────────────────────────────────────────────────────────────
    // 生命周期
    // ──────────────────────────────────────────────────────────────────────────

    @Override
    public void onCreate() {
        super.onCreate();
        mainHandler = new Handler(Looper.getMainLooper());
        createNotificationChannel();
        Log.d(TAG, "Service created");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        boolean wakeEnabled = true;
        if (intent != null) {
            wakeEnabled = intent.getBooleanExtra(EXTRA_WAKE_WORD_ENABLED, true);
        }
        wakeWordEnabled = wakeEnabled;

        startForeground(NOTIFICATION_ID, buildNotification());
        sRunning = true;

        if (ClawPlugin.instance != null) {
            ClawPlugin.instance.onServiceState(true);
        }

        if (wakeWordEnabled && !loopRunning) {
            startWakeWordLoop();
        }

        // 如果服务被系统杀死，尝试重启
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        sRunning = false;
        loopRunning = false;
        stopWakeWordLoop();
        if (ClawPlugin.instance != null) {
            ClawPlugin.instance.onServiceState(false);
        }
        super.onDestroy();
        Log.d(TAG, "Service destroyed");
    }

    public static boolean isRunning() { return sRunning; }

    // ──────────────────────────────────────────────────────────────────────────
    // 动态配置
    // ──────────────────────────────────────────────────────────────────────────

    public void setWakeWordEnabled(boolean enabled) {
        wakeWordEnabled = enabled;
        updateNotification();
        if (enabled && !loopRunning) {
            startWakeWordLoop();
        } else if (!enabled) {
            stopWakeWordLoop();
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 唤醒词循环
    // ──────────────────────────────────────────────────────────────────────────

    private void startWakeWordLoop() {
        mainHandler.post(startListeningRunnable);
    }

    private void stopWakeWordLoop() {
        loopRunning = false;
        mainHandler.removeCallbacks(startListeningRunnable);
        mainHandler.post(() -> {
            if (speechRecognizer != null) {
                speechRecognizer.cancel();
                speechRecognizer.destroy();
                speechRecognizer = null;
            }
        });
    }

    private final Runnable startListeningRunnable = new Runnable() {
        @Override
        public void run() {
            if (!wakeWordEnabled || !sRunning) return;
            loopRunning = true;

            if (speechRecognizer != null) {
                speechRecognizer.cancel();
                speechRecognizer.destroy();
            }

            if (!SpeechRecognizer.isRecognitionAvailable(ClawForegroundService.this)) {
                Log.w(TAG, "SpeechRecognizer not available on this device");
                return;
            }

            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(ClawForegroundService.this);
            speechRecognizer.setRecognitionListener(new RecognitionListener() {

                @Override
                public void onResults(Bundle results) {
                    ArrayList<String> matches = results.getStringArrayList(
                            SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null) {
                        for (String phrase : matches) {
                            String lower = phrase.toLowerCase(Locale.ROOT);
                            for (String w : WAKE_WORDS) {
                                if (lower.contains(w)) {
                                    Log.d(TAG, "Wake word detected: " + phrase);
                                    onWakeWordDetected();
                                    return;
                                }
                            }
                        }
                    }
                    // 没有检测到唤醒词，继续循环
                    scheduleRestart(1500);
                }

                @Override public void onPartialResults(Bundle b) {
                    // 实时检测（提升响应速度）
                    ArrayList<String> partial = b.getStringArrayList(
                            SpeechRecognizer.RESULTS_RECOGNITION);
                    if (partial != null) {
                        for (String phrase : partial) {
                            String lower = phrase.toLowerCase(Locale.ROOT);
                            for (String w : WAKE_WORDS) {
                                if (lower.contains(w)) {
                                    Log.d(TAG, "Wake word (partial): " + phrase);
                                    if (speechRecognizer != null) speechRecognizer.cancel();
                                    onWakeWordDetected();
                                    return;
                                }
                            }
                        }
                    }
                }

                @Override public void onReadyForSpeech(Bundle p)   {}
                @Override public void onBeginningOfSpeech()         {}
                @Override public void onRmsChanged(float rms)       {}
                @Override public void onBufferReceived(byte[] b)    {}
                @Override public void onEndOfSpeech()               {}

                @Override public void onError(int error) {
                    // 常见错误：NO_MATCH(7)、SPEECH_TIMEOUT(6) — 正常情况，继续循环
                    Log.d(TAG, "SR error=" + error);
                    scheduleRestart(2000);
                }

                @Override public void onEvent(int t, Bundle b) {}
            });

            Intent listenIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            listenIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                    RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            listenIntent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            listenIntent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
            // 设置短超时，减少电量消耗
            listenIntent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 500L);
            listenIntent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L);
            listenIntent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L);

            speechRecognizer.startListening(listenIntent);
        }
    };

    private void scheduleRestart(long delayMs) {
        if (!wakeWordEnabled || !sRunning) return;
        mainHandler.postDelayed(startListeningRunnable, delayMs);
    }

    private void onWakeWordDetected() {
        // 短暂暂停循环，等待 H5 完成语音输入
        loopRunning = false;
        mainHandler.removeCallbacks(startListeningRunnable);

        if (ClawPlugin.instance != null) {
            ClawPlugin.instance.onWakeWord();
        }

        // 5 秒后恢复唤醒词监听（给 H5 语音输入足够时间）
        if (wakeWordEnabled) {
            mainHandler.postDelayed(() -> {
                if (wakeWordEnabled && sRunning) startWakeWordLoop();
            }, WAKE_WORD_RESUME_DELAY_MS);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 通知
    // ──────────────────────────────────────────────────────────────────────────

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    getString(R.string.notification_channel_name),
                    NotificationManager.IMPORTANCE_LOW  // 无提示音，静默
            );
            channel.setDescription(getString(R.string.notification_channel_desc));
            channel.setShowBadge(false);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification() {
        Intent tapIntent = new Intent(this, MainActivity.class);
        tapIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String contentText = wakeWordEnabled
                ? getString(R.string.notification_text_wake)
                : getString(R.string.notification_text_idle);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.notification_title))
                .setContentText(contentText)
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setSilent(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();
    }

    private void updateNotification() {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(NOTIFICATION_ID, buildNotification());
    }
}

package com.qingchencloud.clawapp;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(ClawPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

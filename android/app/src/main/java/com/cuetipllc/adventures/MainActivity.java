package com.cuetipllc.adventures;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FireAdsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

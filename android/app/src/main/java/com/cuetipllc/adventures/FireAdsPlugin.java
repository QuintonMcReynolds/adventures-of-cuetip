package com.cuetipllc.adventures;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.vungle.ads.AdConfig;
import com.vungle.ads.BaseAd;
import com.vungle.ads.InitializationListener;
import com.vungle.ads.InterstitialAd;
import com.vungle.ads.InterstitialAdListener;
import com.vungle.ads.RewardedAd;
import com.vungle.ads.RewardedAdListener;
import com.vungle.ads.VungleAds;
import com.vungle.ads.VungleError;

/**
 * Ads for the Amazon (Fire tablet) build via Liftoff Monetize (Vungle SDK),
 * one of the ad SDKs Amazon lists as compatible with Fire tablets.
 *
 * Exposes the same method names the game already uses for AdMob on iPhone,
 * so the JS only switches plugin name. IDs live in capacitor.config.json:
 *   "plugins": { "FireAds": { "appId": "...", "interstitial": "...", "rewarded": "..." } }
 * With no appId, initialize() rejects and the game simply shows no ads.
 */
@CapacitorPlugin(name = "FireAds")
public class FireAdsPlugin extends Plugin {

    private InterstitialAd inter;
    private RewardedAd rewarded;
    private PluginCall interShow;
    private PluginCall rewardShow;
    private boolean earned;

    private String placement(PluginCall call, String key) {
        String id = call.getString("adId", "");
        // Ignore AdMob-style ids from the iPhone code; use this build's Liftoff placement.
        if (id == null || id.isEmpty() || id.startsWith("ca-app-pub")) {
            id = getConfig().getString(key, "");
        }
        return id;
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        String appId = getConfig().getString("appId", "");
        if (appId == null || appId.isEmpty()) {
            call.reject("FireAds: no appId configured");
            return;
        }
        if (VungleAds.isInitialized()) {
            call.resolve();
            return;
        }
        VungleAds.init(getContext(), appId, new InitializationListener() {
            @Override public void onSuccess() { call.resolve(); }
            @Override public void onError(VungleError e) { call.reject(e.getErrorMessage()); }
        });
    }

    // Consent / tracking: Fire OS has no ATT prompt; Liftoff handles its own consent rules.
    @PluginMethod
    public void requestConsentInfo(PluginCall call) {
        JSObject r = new JSObject();
        r.put("status", "NOT_REQUIRED");
        r.put("isConsentFormAvailable", false);
        call.resolve(r);
    }

    @PluginMethod public void showConsentForm(PluginCall call) { call.resolve(); }

    @PluginMethod
    public void trackingAuthorizationStatus(PluginCall call) {
        JSObject r = new JSObject();
        r.put("status", "authorized");
        call.resolve(r);
    }

    @PluginMethod public void requestTrackingAuthorization(PluginCall call) { call.resolve(); }

    @PluginMethod
    public void prepareInterstitial(PluginCall call) {
        String id = placement(call, "interstitial");
        if (id.isEmpty()) { call.reject("FireAds: no interstitial placement"); return; }
        getActivity().runOnUiThread(() -> {
            inter = new InterstitialAd(getContext(), id, new AdConfig());
            inter.setAdListener(new InterstitialAdListener() {
                @Override public void onAdLoaded(BaseAd ad) { call.resolve(); }
                @Override public void onAdFailedToLoad(BaseAd ad, VungleError e) { call.reject(e.getErrorMessage()); }
                @Override public void onAdStart(BaseAd ad) {}
                @Override public void onAdImpression(BaseAd ad) {}
                @Override public void onAdClicked(BaseAd ad) {}
                @Override public void onAdLeftApplication(BaseAd ad) {}
                @Override public void onAdEnd(BaseAd ad) {
                    if (interShow != null) { interShow.resolve(); interShow = null; }
                }
                @Override public void onAdFailedToPlay(BaseAd ad, VungleError e) {
                    if (interShow != null) { interShow.reject(e.getErrorMessage()); interShow = null; }
                }
            });
            inter.load((String) null);
        });
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (inter == null || !Boolean.TRUE.equals(inter.canPlayAd())) { call.reject("FireAds: interstitial not ready"); return; }
            interShow = call;
            inter.play(getActivity());
        });
    }

    @PluginMethod
    public void prepareRewardVideoAd(PluginCall call) {
        String id = placement(call, "rewarded");
        if (id.isEmpty()) { call.reject("FireAds: no rewarded placement"); return; }
        getActivity().runOnUiThread(() -> {
            rewarded = new RewardedAd(getContext(), id, new AdConfig());
            rewarded.setAdListener(new RewardedAdListener() {
                @Override public void onAdLoaded(BaseAd ad) { call.resolve(); }
                @Override public void onAdFailedToLoad(BaseAd ad, VungleError e) { call.reject(e.getErrorMessage()); }
                @Override public void onAdStart(BaseAd ad) {}
                @Override public void onAdImpression(BaseAd ad) {}
                @Override public void onAdClicked(BaseAd ad) {}
                @Override public void onAdLeftApplication(BaseAd ad) {}
                @Override public void onAdRewarded(BaseAd ad) { earned = true; }
                @Override public void onAdEnd(BaseAd ad) {
                    if (rewardShow == null) return;
                    if (earned) {
                        JSObject r = new JSObject();
                        r.put("type", "reward");
                        r.put("amount", 1);
                        rewardShow.resolve(r);
                    } else {
                        rewardShow.reject("FireAds: closed before the reward");
                    }
                    rewardShow = null;
                }
                @Override public void onAdFailedToPlay(BaseAd ad, VungleError e) {
                    if (rewardShow != null) { rewardShow.reject(e.getErrorMessage()); rewardShow = null; }
                }
            });
            rewarded.load((String) null);
        });
    }

    @PluginMethod
    public void showRewardVideoAd(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (rewarded == null || !Boolean.TRUE.equals(rewarded.canPlayAd())) { call.reject("FireAds: rewarded not ready"); return; }
            earned = false;
            rewardShow = call;
            rewarded.play(getActivity());
        });
    }
}

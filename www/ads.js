// Amazon (Fire tablet) build only: Liftoff Monetize ads through the FireAds plugin.
// A full-screen ad at every 2nd chapter card, and a video after a lost fight that
// gives Cuetip two extra medicine shots on the retry. The iPhone/Mac builds have no ads.
"use strict";

const Ads = (() => {
  const A = window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins.FireAds : null;
  const EVERY = 2;
  let inter = false, reward = false, chapters = 0;
  const loadInter = () => A && A.prepareInterstitial({}).then(() => (inter = true), () => (inter = false));
  const loadReward = () => A && A.prepareRewardVideoAd({}).then(() => (reward = true), () => (reward = false));
  // Silence the game's music while an ad plays.
  async function quiet(fn) {
    const c = Sound.ctx;
    try { if (c) await c.suspend(); } catch {}
    try { return await fn(); } finally { try { if (c) await c.resume(); } catch {} }
  }
  (async () => {
    if (!A) return;
    try { await A.initialize(); } catch { return; }
    loadInter(); loadReward();
  })();
  return {
    hasReward: () => reward,
    // resolves true if the player watched to the end
    async watchForReward() {
      if (!reward) return false;
      reward = false;
      try { return !!(await quiet(() => A.showRewardVideoAd())); } catch { return false; } finally { loadReward(); }
    },
    chapter() {
      chapters++;
      if (!inter || chapters < EVERY) return;
      chapters = 0; inter = false;
      quiet(() => A.showInterstitial()).catch(() => {}).finally(loadInter);
    },
  };
})();

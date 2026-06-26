import { initSlotEvents, loadSlot }
    from "./admin-slot.js";

import { initSettingsEvents, loadSiteSettings }
    from "./admin-settings.js";

import { initApplicationEvents }
    from "./admin-applications.js";

import { showView } from "./admin-ui.js";
import { initToast } from "./admin-toast.js";
import { loadDashboard } from "./admin-dashboard.js";
import { initRealtime } from "./admin-realtime.js";
import { loadLogs } from "./admin-log-view.js";

import { initAuth, initLogout }
    from "./admin-auth.js";

/* =========================
   INIT ENTRY
========================= */
document.addEventListener("DOMContentLoaded", async () => {

    console.log("ADMIN SYSTEM LOADED");

    /* 1. TOAST */
    initToast();

    /* 2. AUTH */
    await initAuth();
    initLogout();

    /* 3. VIEW NAV */
    initViewNavigation();

    /* 4. MODULE INIT */
    initSlotEvents();
    initSettingsEvents();
    initApplicationEvents();

    /* 5. INITIAL LOAD */
    await Promise.all([
        loadSlot(),
        loadSiteSettings(),
        loadDashboard(),
        loadLogs()
    ]);

    /* 6. REALTIME */
    initRealtime();

    /* 7. DEFAULT VIEW */
    showView("view-dashboard");

});


/* =========================
   VIEW NAVIGATION
========================= */
function initViewNavigation() {

    document.querySelectorAll(".menu-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            showView(btn.dataset.view);
        });
    });
}
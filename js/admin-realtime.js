import { sb } from "./supabaseClient.js";
import { loadApplications } from "./admin-applications.js";
import { loadSlot } from "./admin-slot.js";
import { loadSiteSettings } from "./admin-settings.js";
import { loadDashboard } from "./admin-dashboard.js";
import { loadLogs } from "./admin-log-view.js";

/* =========================
   STATE
========================= */
let realtimeInitialized = false;

/* =========================
   INIT REALTIME
========================= */
export function initRealtime() {

    if (realtimeInitialized) return;
    realtimeInitialized = true;

    console.log("Realtime Started");

    /* applications */
    sb.channel("admin-applications")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "applications"
            },
            async (payload) => {

                console.log("applications change:", payload);

                await loadApplications();
                await loadDashboard();
            }
        )
        .subscribe();

    /* site_settings */
    sb.channel("admin-settings")
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "site_settings",
                filter: "id=eq.1"
            },
            async (payload) => {

                console.log("settings change:", payload);

                await loadSlot();
                await loadSiteSettings();
                await loadDashboard();
            }
        )
        .subscribe();

    /* =========================
    ADMIN LOGS
    ========================= */
    sb.channel("admin-logs")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "admin_logs"
            },
            () => {
                loadLogs();
            }
        )
        .subscribe();
}
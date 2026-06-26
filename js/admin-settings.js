import { sb } from "./supabaseClient.js";
import { showToast } from "./admin-toast.js";
import { addLog } from "./admin-log.js";
import { currentAdminEmail } from "./admin-auth.js";

/* =========================
   LOAD
========================= */
export async function loadSiteSettings() {

    const { data, error } = await sb
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();

    if (error) {
        console.error("settings load error:", error);
        return;
    }

    const noticeEl = document.getElementById("notice");
    const statusEl = document.getElementById("siteStatus");

    if (noticeEl) noticeEl.value = data.notice || "";
    if (statusEl) statusEl.value = data.status || "on";
}

/* =========================
   SAVE
========================= */
export async function saveSiteSettings() {

    const { error } = await sb
        .from("site_settings")
        .update({
            notice: document.getElementById("notice")?.value,
            status: document.getElementById("siteStatus")?.value
        })
        .eq("id", 1);

    if (error) {
        console.error("settings save error:", error);
        showToast("설정 저장 실패", "error");
        return;
    }

    showToast("설정 저장 완료", "success");

    // ✅ 로그 (비동기 안전 처리)
    addLog(
        "update site settings",
        "notice/status changed",
        currentAdminEmail
    ).catch(err => console.error("log fail:", err));

    loadSiteSettings();
}

/* =========================
   EVENTS
========================= */
export function initSettingsEvents() {

    const btn = document.getElementById("saveSiteBtn");

    if (!btn) return;

    btn.addEventListener("click", saveSiteSettings);
}
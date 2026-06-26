import { sb } from "./supabaseClient.js";
import { showToast } from "./admin-toast.js";
import { loadDashboard } from "./admin-dashboard.js";
import { addLog } from "./admin-log.js";
import { currentAdminEmail } from "./admin-auth.js";

/* =========================
   SLOT LOAD
========================= */
export async function loadSlot() {

    const { data, error } = await sb
        .from("site_settings")
        .select('status,total_slot')
        .eq("id", 1)
        .single();

    if (error || !data) {
        console.error("slot load error:", error);
        return;
    }

    const currentEl = document.getElementById("currentCount");
    const maxEl = document.getElementById("maxCount");

    if (currentEl) currentEl.value = data.status ?? '';
    if (maxEl) maxEl.value = data.total_slot;
}

/* =========================
   SLOT SAVE
========================= */
export async function saveSlot() {

    const current = Number(document.getElementById("currentCount")?.value || 0);
    const max = Number(document.getElementById("maxCount")?.value || 1);

    if (current > max) {
        showToast("현재 슬롯은 최대 슬롯보다 클 수 없습니다.", "error");
        return;
    }

    const { error } = await sb
        .from("site_settings")
        .update({
            status: current,
            total_slot: max
        })
        .eq("id", 1);

    if (error) {
        console.error("slot save error:", error);
        showToast("슬롯 저장 실패", "error");
        return;
    }

    showToast("슬롯 저장 완료", "success");

    // 로그 (비동기 안전)
    addLog(
        "update slot",
        `${current}/${max}`,
        currentAdminEmail
    ).catch(err => console.error("log fail:", err));

    // UI sync (순서 안정화)
    await loadSlot();
    await loadDashboard();
}

/* =========================
   EVENT INIT
========================= */
export function initSlotEvents() {
    const btn = document.getElementById("saveSlotBtn");

    if (!btn) return;

    btn.addEventListener("click", saveSlot);
}
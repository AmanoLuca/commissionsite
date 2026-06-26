import { sb } from './supabaseClient.js';

/* =========================
   LOAD DASHBOARD (FINAL)
========================= */
export async function loadDashboard() {
    try {
        const [appRes, slotRes] = await Promise.all([
            sb.from("applications").select("status"),
            sb.from("site_settings").select('status,total_slot').eq("id", 1).single()
        ]);

        const { data: apps, error: appError } = appRes;
        const { data: slot, error: slotError } = slotRes;

        if (appError) {
            console.error("dashboard app error:", appError);
            return;
        }

        if (slotError || !slot) {
            console.error("dashboard slot error:", slotError);
            return;
        }

        const total = apps?.length || 0;
        const done = (apps || []).filter(a => a.status === "done").length;
        const pending = total - done;

        const current = Number(slot.status ?? 0);
        const max = slot.total_slot || 0;
        const remain = Math.max(0, max - current);

        /* UI 업데이트 */
        setText("totalCount", total);
        setText("doneCount", done);
        setText("pendingCount", pending);

        setText("currentSlot", current);
        setText("maxSlot", max);
        setText("remainSlot", remain);

    } catch (err) {
        console.error("dashboard fatal error:", err);
    }
}

/* =========================
   SAFE UI HELPER
========================= */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}
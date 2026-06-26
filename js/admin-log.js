import { sb } from "./supabaseClient.js";

/* =========================
   ADD LOG
========================= */
export async function addLog(action, target, email) {

    const { error } = await sb
        .from("admin_logs")
        .insert({
            action,
            target,
            admin_email: email || "unknown"
        });

    if (error) {
        console.error("[ADMIN LOG ERROR]", {
            action,
            target,
            email,
            error
        });
    }
}
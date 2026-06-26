import { sb } from "./supabaseClient.js";

/* =========================
   GLOBAL STATE
========================= */
export let currentAdminEmail = null;

/* =========================
   AUTH INIT
========================= */
export async function initAuth() {
    await checkAdmin();
}

/* =========================
   CHECK SESSION
========================= */
async function checkAdmin() {

    const { data, error } = await sb.auth.getSession();

    if (error) {
        console.error("auth error:", error);
        alert("인증 오류");
        return;
    }

    const session = data?.session;

    if (!session) {
        alert("로그인이 필요합니다.");
        location.href = "login.html";
        return;
    }

    // ✅ 글로벌 저장
    currentAdminEmail = session.user.email;

    const el = document.getElementById("userInfo");
    if (el) {
        el.textContent = `로그인됨 : ${currentAdminEmail}`;
    }
}

/* =========================
   LOGOUT
========================= */
export function initLogout() {

    const btn = document.getElementById("logoutBtn");

    if (!btn) return;

    btn.addEventListener("click", async () => {

        await sb.auth.signOut();

        currentAdminEmail = null;

        location.href = "login.html";
    });
}
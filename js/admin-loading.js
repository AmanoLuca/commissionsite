import { sb } from "./supabaseClient.js";
import { showToast } from "./admin-toast.js";

/* =========================
   LOAD
========================= */
export async function loadApplications() {

    const { data, error } = await sb
        .from("applications")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    const list = document.getElementById("applyList");

    if (!list || !data) return;

    list.innerHTML = data.map(app => `
        <div class="card">
            <h3>${app.name}</h3>
            <p>${app.email}</p>
            <p>${app.status}</p>

            <button class="done-btn" data-id="${app.id}">완료</button>
            <button class="delete-btn" data-id="${app.id}">삭제</button>
        </div>
    `).join("");

    bindApplicationEvents();
}

/* =========================
   UPDATE
========================= */
export async function updateStatus(id, status) {

    const { error } = await sb
        .from("applications")
        .update({ status })
        .eq("id", id);

    if (error) {
        console.error("update error:", error);
        showToast("상태 변경 실패", "error");
        return;
    }

    showToast("상태 변경 완료", "success");

    loadApplications();
}

/* =========================
   DELETE
========================= */
export async function deleteApplication(id) {

    if (!confirm("삭제?")) return;

    const { error } = await sb
        .from("applications")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("delete error:", error);
        showToast("삭제 실패", "error");
        return;
    }

    showToast("삭제 완료", "success");

    loadApplications();
}

/* =========================
   INIT
========================= */
export function initApplicationEvents() {
    loadApplications();
}

/* =========================
   EVENT BINDING (FIXED)
========================= */
function bindApplicationEvents() {

    const list = document.getElementById("applyList");

    if (!list) return;

    list.addEventListener("click", (e) => {

        const doneBtn = e.target.closest(".done-btn");
        const deleteBtn = e.target.closest(".delete-btn");

        if (doneBtn) {
            updateStatus(doneBtn.dataset.id, "done");
        }

        if (deleteBtn) {
            deleteApplication(deleteBtn.dataset.id);
        }
    });
}
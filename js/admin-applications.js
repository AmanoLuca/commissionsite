import { sb } from "./supabaseClient.js";
import { showToast } from "./admin-toast.js";
import { loadDashboard } from "./admin-dashboard.js";
import { addLog } from "./admin-log.js";
import { currentAdminEmail } from "./admin-auth.js";

let applications = [];

let currentPage = 1;
const PAGE_SIZE = 20;

/* =========================
   LOAD APPLICATIONS
========================= */
export async function loadApplications() {
    const { data, error } = await sb
        .from("applications")
        .select("*")
        .order("sort_order", { ascending: true });

    if (error) {
        console.error(error);
        showToast("신청 데이터 로드 실패", "error");
        return;
    }

    applications = data ?? [];
    renderApplications();
}

/* =========================
   FILTER
========================= */
function getFilteredApplications() {
    const keyword =
        document.getElementById("searchInput")?.value?.toLowerCase().trim() || "";

    const status =
        document.getElementById("statusFilter")?.value || "";

    return applications.filter(app => {
        const matchKeyword =
            app.name?.toLowerCase().includes(keyword) ||
            app.email?.toLowerCase().includes(keyword);

        const matchStatus =
            !status || app.status === status;

        return matchKeyword && matchStatus;
    });
}

/* =========================
   RENDER
========================= */
function renderApplications() {
    const list = document.getElementById("applyList");
    if (!list) return;

    const filtered = getFilteredApplications();

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    list.innerHTML = pageItems.map((app, index) => {

        // ⭐ 핵심: 페이지 기준 번호
        const number = start + index + 1;

        return `
        <tr>
            <td>${number}</td>

            <td>${app.name}</td>
            <td>${app.email}</td>

            <td>
                <select class="status-select" data-id="${app.id}">
                    <option value="pending" ${app.status === "pending" ? "selected" : ""}>대기</option>
                    <option value="progress" ${app.status === "progress" ? "selected" : ""}>진행중</option>
                    <option value="done" ${app.status === "done" ? "selected" : ""}>완료</option>
                </select>
            </td>

            <td>${new Date(app.created_at).toLocaleDateString()}</td>

            <td>
                <button class="move-up-btn" data-id="${app.id}">▲</button>
                <button class="move-down-btn" data-id="${app.id}">▼</button>
            </td>

            <td>
                <button class="detail-btn" data-id="${app.id}">상세</button>
            </td>

            <td>
                <button class="delete-btn" data-id="${app.id}">삭제</button>
            </td>
        </tr>
        `;
    }).join("");

    renderPagination(totalPages);
}

/* =========================
   PAGINATION
========================= */
function renderPagination(totalPages) {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    pagination.innerHTML = `
        <button id="prevPage" ${currentPage === 1 ? "disabled" : ""}>이전</button>
        <span>${currentPage} / ${totalPages}</span>
        <button id="nextPage" ${currentPage === totalPages ? "disabled" : ""}>다음</button>
    `;
}

/* =========================
   UPDATE STATUS
========================= */
async function updateStatus(id, status) {

    const app = applications.find(a => a.id === id);

    if (app) {

        const oldStatus = app.status;

        if (oldStatus !== "done" && status === "done") {

            await sb.rpc("increment_slot");

        } else if (oldStatus === "done" && status !== "done") {

            await sb.rpc("decrement_slot");

        }
    }

    const { error } = await sb
        .from("applications")
        .update({ status })
        .eq("id", id);

    if (error) {
        console.error(error);
        return;
    }

    await loadApplications();
    await loadDashboard();
}

/* =========================
   DELETE
========================= */
async function deleteApplication(id) {

    if (!confirm("삭제하시겠습니까?")) return;

    const app = applications.find(a => a.id == id);

    // 완료건 삭제 시 슬롯 복구
    if (app?.status === "done") {
        await sb.rpc("decrement_slot");
    }

    const { error } = await sb
        .from("applications")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        showToast("삭제 실패", "error");
        return;
    }

    showToast("삭제 완료", "success");

    await addLog(
        "delete application",
        `application #${id}`,
        currentAdminEmail
    );

    await loadApplications();
    await loadDashboard();
}

/* =========================
   MOVE (SORT ORDER SWAP)
========================= */
async function moveApplication(id, direction) {
    const filtered = getFilteredApplications();

    const index = filtered.findIndex(a => a.id == id);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filtered.length) return;

    const current = filtered[index];
    const target = filtered[targetIndex];

    const temp = current.sort_order;

    const { error: e1 } = await sb
        .from("applications")
        .update({ sort_order: target.sort_order })
        .eq("id", current.id);

    const { error: e2 } = await sb
        .from("applications")
        .update({ sort_order: temp })
        .eq("id", target.id);

    if (e1 || e2) {
        console.error(e1 || e2);
        showToast("순서 변경 실패", "error");
        return;
    }

    showToast("순서 변경 완료", "success");
    await loadApplications();
}

/* =========================
   EVENTS
========================= */
function bindApplicationEvents() {
    const list = document.getElementById("applyList");
    if (!list) return;

    if (list.dataset.bound === "true") return;
    list.dataset.bound = "true";

    document.getElementById("searchInput")?.addEventListener("input", () => {
        currentPage = 1;
        renderApplications();
    });

    document.getElementById("statusFilter")?.addEventListener("change", () => {
        currentPage = 1;
        renderApplications();
    });

    document.addEventListener("click", (e) => {
        if (e.target.id === "prevPage") {
            if (currentPage > 1) {
                currentPage--;
                renderApplications();
            }
        }

        if (e.target.id === "nextPage") {
            const total = Math.max(1, Math.ceil(getFilteredApplications().length / PAGE_SIZE));
            if (currentPage < total) {
                currentPage++;
                renderApplications();
            }
        }
    });

    list.addEventListener("click", (e) => {
        const up = e.target.closest(".move-up-btn");
        const down = e.target.closest(".move-down-btn");
        const detail = e.target.closest(".detail-btn");
        const del = e.target.closest(".delete-btn");

        if (up) moveApplication(up.dataset.id, "up");
        if (down) moveApplication(down.dataset.id, "down");

        if (detail) {
            const app = applications.find(a => a.id == detail.dataset.id);
            if (app) openDetail(app);
        }

        if (del) deleteApplication(del.dataset.id);
    });

    list.addEventListener("change", (e) => {
        const select = e.target.closest(".status-select");
        if (!select) return;

        updateStatus(select.dataset.id, select.value);
    });
}

/* =========================
   INIT
========================= */
export function initApplicationEvents() {
    bindApplicationEvents();
    loadApplications();
}
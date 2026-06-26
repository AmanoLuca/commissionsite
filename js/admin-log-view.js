import { sb } from "./supabaseClient.js";

let logs = [];

/* =========================
   LOAD LOGS
========================= */
export async function loadLogs() {

    const { data, error } = await sb
        .from("admin_logs")
        .select("*")
        .order("id", { ascending: false })
        .limit(100);

    if (error) {
        console.error("log load error:", error);
        return;
    }

    logs = data || [];

    renderLogs();

    const searchInput =
        document.getElementById("logSearchInput");

    if (
        searchInput &&
        !searchInput.dataset.bound
    ) {

        searchInput.dataset.bound = "true";

        searchInput.addEventListener(
            "input",
            renderLogs
        );
    }
}

/* =========================
   RENDER LOGS
========================= */
function renderLogs() {

    const list =
        document.getElementById("logList");

    if (!list) return;

    const keyword =
        document.getElementById("logSearchInput")
            ?.value
            ?.toLowerCase()
            ?.trim() || "";

    let filtered = [...logs];

    if (keyword) {

        filtered = filtered.filter(log =>
            (log.admin_email || "")
                .toLowerCase()
                .includes(keyword)
        );
    }

    if (filtered.length === 0) {

        list.innerHTML = `
            <p>검색 결과 없음</p>
        `;

        return;
    }

    list.innerHTML = filtered.map(log => `

        <div class="card">

            <p>
                <b>${log.action}</b>
            </p>

            <p>
                ${log.target || "-"}
            </p>

            <p>
                관리자 :
                ${log.admin_email || "-"}
            </p>

            <p>
                ${new Date(log.created_at)
                    .toLocaleString()}
            </p>

        </div>

    `).join("");
}
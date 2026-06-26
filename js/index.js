import { sb } from './supabaseClient.js';

/* ================= SLOT ================= */
async function getSlotData() {
    const { data } = await sb
        .from("site_settings")
        .select("status,total_slot")
        .eq("id", 1)
        .maybeSingle();

    return {
        total: Number(data?.total_slot ?? 0),
        used: parseInt(data?.status ?? 0, 10) || 0
    };
}

async function loadSlot() {
    const slot = await getSlotData();

    const slotText = document.getElementById("slotText");
    if (!slotText) return;

    slotText.classList.remove("slot-open", "slot-full");

    if (slot.used >= slot.total) {
        slotText.textContent = "FULL";
        slotText.classList.add("slot-full");
    } else {
        slotText.textContent = `${slot.used} / ${slot.total} OPEN`;
        slotText.classList.add("slot-open");
    }

    document.querySelectorAll(".slot-icons img").forEach((img, i) => {
        img.src = i < slot.used
            ? "images/slot-on.png"
            : "images/slot-off.png";
    });
}

/* ================= APPLICATION LIST ================= */
async function loadApplications() {
    const container = document.getElementById("applicationList");
    if (!container) return;

    container.innerHTML = "<p>불러오는 중...</p>";

    const { data, error } = await sb
        .from("applications")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        container.innerHTML = "<p>데이터 불러오기 실패</p>";
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = data.map(app => `
        <div class="app-card" data-id="${app.id}">
            <div class="app-info">
                <strong>${app.name ?? "이름 없음"}</strong>
                <p>${app.type ?? "타입 없음"}</p>
                <span>${app.status ?? "대기"}</span>
            </div>

            <button class="delete-btn" onclick="deleteApplication(${app.id})">
                삭제
            </button>
        </div>
    `).join("");
}

/* ================= DELETE ================= */
window.deleteApplication = async function (id) {
    const confirmDelete = confirm("정말 삭제할까요?");
    if (!confirmDelete) return;

    const { error } = await sb
        .from("applications")
        .delete()
        .eq("id", id);

    if (error) {
        alert("삭제 실패");
        console.error(error);
        return;
    }

    loadApplications(); // 🔥 다시 로드
    loadSlot();         // 🔥 슬롯도 갱신
};

/* ================= INIT ================= */
function initIcons() {
    if (window.lucide) lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", () => {
    loadSlot();
    loadApplications();
    initIcons();
});
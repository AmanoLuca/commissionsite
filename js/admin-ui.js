let currentView = "view-dashboard";

const views = document.querySelectorAll(".view");
const menuBtns = document.querySelectorAll(".menu-btn");

/* =========================
   VIEW SWITCHER
========================= */
export function showView(id) {

    // 이미 같은 화면이면 아무 것도 안 함
    if (currentView === id) return;

    const target = document.getElementById(id);

    if (!target) {
        console.warn(`View not found: ${id}`);
        return;
    }

    // hide all views
    views.forEach(v => {
        v.style.display = "none";
    });

    // show target
    target.style.display = "block";

    currentView = id;

    updateActiveMenu(id);
}

/* =========================
   ACTIVE MENU UI
========================= */
function updateActiveMenu(id) {

    menuBtns.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === id);
    });
}

/* =========================
   GETTER
========================= */
export function getCurrentView() {
    return currentView;
}
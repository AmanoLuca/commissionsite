/* =========================
   TOAST ROOT
========================= */
let toastContainer = null;

/* =========================
   INIT
========================= */
export function initToast() {

    if (document.getElementById("toastContainer")) return;

    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";

    toastContainer.style.position = "fixed";
    toastContainer.style.top = "20px";
    toastContainer.style.right = "20px";
    toastContainer.style.zIndex = "9999";

    document.body.appendChild(toastContainer);
}

/* =========================
   SHOW TOAST
========================= */
export function showToast(message, type = "success") {

    if (!toastContainer) {
        toastContainer = document.getElementById("toastContainer");
    }

    if (!toastContainer) {
        initToast();
    }

    const toast = document.createElement("div");

    toast.textContent = message;

    toast.style.minWidth = "220px";
    toast.style.marginBottom = "10px";
    toast.style.padding = "12px 16px";
    toast.style.borderRadius = "12px";
    toast.style.color = "#fff";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "0 8px 24px rgba(0,0,0,.15)";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    toast.style.transition = "all .25s ease";

    switch (type) {
        case "error":
            toast.style.background = "#ef4444";
            break;

        case "warning":
            toast.style.background = "#f59e0b";
            break;

        default:
            toast.style.background = "#22c55e";
    }

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";

        setTimeout(() => {
            toast.remove();
        }, 250);

    }, 2500);
}
// ================= TOAST DE NOTIFICAÇÃO =================
// Feedback visual reutilizável (sucesso/erro), usado no cadastro e na exclusão.

export function mostrarToast(msg, tipo = "sucesso") {
    const toast = document.createElement("div");
    toast.className = "toast-sucesso";
    const icone = tipo === "sucesso" ? "fa-check-circle" : "fa-exclamation-circle";
    if (tipo === "erro") toast.style.background = "#991b1b";
    toast.innerHTML = `<i class="fas ${icone}"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("visivel"), 50);
    setTimeout(() => {
        toast.classList.remove("visivel");
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}
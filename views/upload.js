import {
    getViewUpload,
    getAiPanelUpload,
    esconderTodasViews,
    sairModoCadastro,
    setWorkflowStep
} from "../utils/dom.js";

export function mostrarUpload() {
    esconderTodasViews();
    sairModoCadastro();
    getViewUpload().style.display    = "flex";
    getAiPanelUpload().style.display = "block";
    setWorkflowStep("upload");
}

export function registrarEventosUpload() {
    const dropzone      = document.getElementById("upload-dropzone");
    const input         = document.getElementById("upload-input");
    const btnSelecionar = document.getElementById("btn-selecionar-arquivo");
    const preview       = document.getElementById("upload-preview");
    const fileName      = document.getElementById("upload-file-name");
    const fileSize      = document.getElementById("upload-file-size");
    const btnRemover    = document.getElementById("btn-remover-arquivo");
    const btnAvancar    = document.getElementById("btn-avancar-cadastro");
    const uploadError   = document.getElementById("upload-error");

    function formatarTamanho(bytes) {
        if (bytes < 1024)        return `${bytes} B`;
        if (bytes < 1048576)     return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    }

    function mostrarArquivo(file) {
        if (!file || file.type !== "application/pdf") {
            document.getElementById("upload-error-msg").textContent = "Selecione um arquivo PDF válido.";
            uploadError.style.display = "flex";
            return;
        }
        uploadError.style.display = "none";
        fileName.textContent      = file.name;
        fileSize.textContent      = formatarTamanho(file.size);
        preview.style.display     = "flex";
        dropzone.style.display    = "none";
        btnAvancar.disabled       = false;
    }

    function removerArquivo() {
        input.value               = "";
        preview.style.display     = "none";
        dropzone.style.display    = "flex";
        btnAvancar.disabled       = true;
        uploadError.style.display = "none";
    }

    btnSelecionar.addEventListener("click", () => input.click());

    input.addEventListener("change", () => {
        if (input.files[0]) mostrarArquivo(input.files[0]);
    });

    btnRemover.addEventListener("click", removerArquivo);

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("upload-dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("upload-dragover");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("upload-dragover");
        const file = e.dataTransfer.files[0];
        if (file) mostrarArquivo(file);
    });

    function irParaCadastro() {
    document.querySelectorAll(".nav-item").forEach(link => link.classList.remove("active"));
    const itemCadastro = document.querySelector('[data-section="cadastrar"]');
    if (itemCadastro) itemCadastro.classList.add("active");
    import("./cadastro.js").then(({ mostrarCadastro }) => mostrarCadastro());
}

btnAvancar.addEventListener("click", irParaCadastro);

const btnPular = document.getElementById("btn-pular-upload");
if (btnPular) btnPular.addEventListener("click", irParaCadastro);

}

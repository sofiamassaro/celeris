import { listarProcessos, buscarProcesso } from "../data/processos.js";

import {
    getViewFila,
    getViewDocumento,
    getAiPanelFila,
    getAiPanelDoc,
    getDocTitle,
    getDocMeta,
    getDocContentText,
    getDocTags,
    getDocRepetitivos,
    getBackProcessNum,
    esconderTodasViews,
    sairModoCadastro,
    setWorkflowStep
} from "../utils/dom.js";

// ================= UTILITÁRIOS =================
function formatarDataBR(dataIso) {
    if (!dataIso) return "—";
    const d = new Date(dataIso);
    return d.toLocaleDateString("pt-BR");
}

// ================= RENDERIZAÇÃO DOS CARDS =================
function criarCardProcesso(p) {
    const labels = { normal: "Normal", prioritario: "Prioritário", urgente: "Urgente" };
    const textoRep = p.repetitivos === 1 ? "1 repetitivo" : `${p.repetitivos} repetitivos`;
    const tagPrincipal = p.tags && p.tags.length > 0 ? p.tags[0].nome : "Sem tag";

    const card = document.createElement("div");
    card.className = "process-card";
    card.setAttribute("data-id", p.id);
    card.innerHTML = `
        <div class="process-card-top">
            <span class="process-num">${p.numero}</span>
            <span class="status-badge ${p.status}">${labels[p.status]}</span>
        </div>
        <div class="process-card-title">${p.requerente} vs. ${p.requerido}</div>
        <div class="process-card-sub">${p.assunto}</div>
        <div class="process-card-meta">
            <span class="process-tag">${tagPrincipal}</span>
            <span class="process-meta-info"><i class="fas fa-calendar-alt"></i> Entrada: ${formatarDataBR(p.data_entrada)}</span>
            <span class="process-meta-info"><i class="fas fa-copy"></i> ${textoRep}</span>
        </div>
    `;
    card.addEventListener("click", () => abrirProcesso(p.id));
    return card;
}

export async function renderizarFila() {
    const lista = document.getElementById("process-list");
    const filaCount = document.getElementById("fila-count");
    try {
        const processos = await listarProcessos();
        lista.innerHTML = "";
        processos.forEach(p => lista.appendChild(criarCardProcesso(p)));
        filaCount.textContent = `${processos.length} processos aguardando`;
        const badge = document.getElementById("badge-triagem");
        if (badge) badge.textContent = processos.length;
    } catch (e) {
        lista.innerHTML = `<p style="color: #991b1b; padding: 20px;">Erro ao carregar processos: ${e.message}</p>`;
        filaCount.textContent = "Erro";
    }
}

// ================= ABRIR PROCESSO INDIVIDUAL =================
export async function abrirProcesso(id) {
    try {
        const p = await buscarProcesso(id);

        getDocTitle().textContent = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA VARA BANCÁRIA`;
        getDocMeta().innerHTML = `
            <p><strong>REQUERENTE:</strong> ${p.requerente}${p.cpf_requerente ? ` — CPF: ${p.cpf_requerente}` : ""}</p>
            <p><strong>REQUERIDO:</strong> ${p.requerido}${p.cpf_requerido ? ` — CPF: ${p.cpf_requerido}` : ""}</p>
            <p><strong>ASSUNTO:</strong> ${p.assunto}</p>
            <p><strong>NÚMERO:</strong> ${p.numero}</p>
        `;
        getDocContentText().textContent = p.conteudo;
        getBackProcessNum().textContent = p.numero;

        getDocTags().innerHTML = p.tags
            .map(t => `<span class="tag">${t.nome}</span>`)
            .join("");

        const textoRep = p.repetitivos === 0
            ? "Nenhum processo repetitivo encontrado."
            : `Foram encontrados <strong>${p.repetitivos} processos idênticos</strong>`;
        getDocRepetitivos().innerHTML = textoRep;

        esconderTodasViews();
        sairModoCadastro();
        getViewDocumento().style.display = "flex";
        getAiPanelDoc().style.display = "block";
        setWorkflowStep("analise");
    } catch (e) {
        alert("Erro ao abrir processo: " + e.message);
    }
}

// ================= VOLTAR PARA A FILA =================
export function voltarParaFila() {
    esconderTodasViews();
    sairModoCadastro();
    getViewFila().style.display    = "flex";
    getAiPanelFila().style.display = "block";
    setWorkflowStep("triagem");
}
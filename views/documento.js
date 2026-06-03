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

// ================= ESTADO DA FILA =================
// Cache do último array de processos vindo da API, usado pelos filtros
// e pela atualização dinâmica do card de Alertas no painel lateral.
let processosCache = [];
// Filtro ativo da fila: null = sem filtro, "urgente"/"prioritario"/"normal" = filtra por status
let filtroAtivo = null;

// ================= UTILITÁRIOS =================
function formatarDataBR(dataIso) {
    if (!dataIso) return "—";
    const d = new Date(dataIso);
    return d.toLocaleDateString("pt-BR");
}

// ================= RENDERIZAÇÃO DOS CARDS =================
function criarCardProcesso(p) {
    const labels = { normal: "Normal", prioritario: "Prioritário", urgente: "Urgente" };
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
        </div>
    `;
    card.addEventListener("click", () => abrirProcesso(p.id));
    return card;
}

// Faz fetch UMA vez, popula o cache e dispara a renderização (respeitando o filtro ativo).
// Chamada no init e sempre que um novo processo é cadastrado.
export async function renderizarFila() {
    const lista = document.getElementById("process-list");
    const filaCount = document.getElementById("fila-count");
    try {
        processosCache = await listarProcessos();
        aplicarRender();
        const badge = document.getElementById("badge-triagem");
        if (badge) badge.textContent = processosCache.length;
        atualizarAlertaUrgentes();
    } catch (e) {
        lista.innerHTML = `<p style="color: #991b1b; padding: 20px;">Erro ao carregar processos: ${e.message}</p>`;
        filaCount.textContent = "Erro";
    }
}

// Renderiza a lista a partir do cache, aplicando o filtro ativo se houver.
// Separada de renderizarFila() para que o filtro não precise refazer fetch.
function aplicarRender() {
    const lista = document.getElementById("process-list");
    const filaCount = document.getElementById("fila-count");

    const labels = { urgente: "urgentes", prioritario: "prioritários", normal: "normais" };
    const visiveis = filtroAtivo
        ? processosCache.filter(p => p.status === filtroAtivo)
        : processosCache;

    lista.innerHTML = "";

    // chip de filtro ativo
    if (filtroAtivo) {
        const chip = document.createElement("div");
        chip.className = "filtro-chip";
        chip.innerHTML = `
            <span>Filtrando: ${labels[filtroAtivo].charAt(0).toUpperCase() + labels[filtroAtivo].slice(1)}</span>
            <button class="filtro-chip-clear" aria-label="Limpar filtro">
                <i class="fas fa-times"></i>
            </button>
        `;
        chip.querySelector(".filtro-chip-clear").addEventListener("click", limparFiltro);
        lista.appendChild(chip);
    }

    visiveis.forEach(p => lista.appendChild(criarCardProcesso(p)));

    if (filtroAtivo) {
        filaCount.textContent = `${visiveis.length} processos ${labels[filtroAtivo]}`;
    } else {
        filaCount.textContent = `${visiveis.length} processos aguardando`;
    }
}

// Aplica filtro por status SEM refazer fetch (usa o cache).
// Exportada para ser chamada pelo handler do card de Alertas no app.js.
export function filtrarFilaPorStatus(status) {
    filtroAtivo = status;
    aplicarRender();
}

export function limparFiltro() {
    filtroAtivo = null;
    aplicarRender();
}

// Atualiza dinamicamente o número de urgentes no card de Alertas do ai-panel.
// Mantém o HTML "burro": ele só tem placeholders, o JS preenche.
function atualizarAlertaUrgentes() {
    const urgentes = processosCache.filter(p => p.status === "urgente").length;
    const elNum = document.getElementById("alerta-urgentes-num");
    const elTxt = document.getElementById("alerta-urgentes-txt");
    if (elNum) elNum.textContent = urgentes;
    if (elTxt) {
        elTxt.textContent = urgentes === 1
            ? "processo urgente precisa"
            : "processos urgentes precisam";
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
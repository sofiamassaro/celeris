import {
    getViewCadastro,
    getViewConfirmacao,
    esconderTodasViews,
    navItems,
    setWorkflowStep
} from "../utils/dom.js";

import { voltarParaFila, renderizarFila } from "./documento.js";
import { criarProcesso, listarTags } from "../data/processos.js";

const TAGS_POR_CLASSE = {
    "Ação Revisional de Juros":             ["Direito Bancário", "Revisional de Juros"],
    "Indenização por Dano Moral":           ["Consumidor", "Dano Moral"],
    "Cobrança Indevida de Tarifas":         ["Direito Bancário", "Tarifas"],
    "Negativação Indevida no SPC/Serasa":   ["Consumidor", "Negativação"],
    "Revisão de Contrato de Financiamento": ["Financiamento", "Imobiliário"],
    "Revisão de Empréstimo Consignado":     ["Consignado", "Revisão Contratual"],
    "Revisão de Limite de Crédito":         ["Crédito", "Fintech"],
    "Execução de Título Extrajudicial":     ["Execução", "Título Extrajudicial"],
    "Ação Monitória":                       ["Monitória", "Cobrança"],
    "Outro":                                ["Outros"]
};

function formatarData(valor) {
    if (!valor) return "—";
    const [ano, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${ano}`;
}

function atualizarPreviewTags(classe, campoTagsPreview) {
    const tags = TAGS_POR_CLASSE[classe];
    if (!tags) {
        campoTagsPreview.innerHTML =
            `<span class="form-tags-placeholder">Selecione a classe processual para gerar as tags</span>`;
        return;
    }
    campoTagsPreview.innerHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join("");
}

function mostrarToast(msg, tipo = "sucesso") {
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

export function mostrarCadastro() {
    const formError = document.getElementById("form-error");
    esconderTodasViews();
    getViewCadastro().style.display = "flex";
    formError.style.display         = "none";
    document.body.classList.add("modo-cadastro");
    setWorkflowStep("cadastrar");
}

export function registrarEventos() {
    const campoNumero       = document.getElementById("cad-numero");
    const campoData         = document.getElementById("cad-data");
    const campoRequerente   = document.getElementById("cad-requerente");
    const campoCpf          = document.getElementById("cad-cpf");
    const campoRequerido    = document.getElementById("cad-requerido");
    const campoCpfRequerido = document.getElementById("cad-cpf-requerido");
    const campoClasse       = document.getElementById("cad-classe");
    const campoPrioridade   = document.getElementById("cad-prioridade");
    const campoConteudo     = document.getElementById("cad-conteudo");
    const campoObs          = document.getElementById("cad-obs");
    const campoTagsPreview  = document.getElementById("cad-tags-preview");
    const formError         = document.getElementById("form-error");
    const formErrorMsg      = document.getElementById("form-error-msg");

    const confNumero          = document.getElementById("conf-numero");
    const confData            = document.getElementById("conf-data");
    const confRequerente      = document.getElementById("conf-requerente");
    const confRequerido       = document.getElementById("conf-requerido");
    const confClasse          = document.getElementById("conf-classe");
    const confPrioridade      = document.getElementById("conf-prioridade");
    const confBadge           = document.getElementById("conf-badge");
    const confTags            = document.getElementById("conf-tags");
    const confConteudo        = document.getElementById("conf-conteudo");
    const confConteudoWrapper = document.getElementById("conf-conteudo-wrapper");
    const confObs             = document.getElementById("conf-obs");
    const confObsWrapper      = document.getElementById("conf-obs-wrapper");

    campoClasse.addEventListener("change", function () {
        atualizarPreviewTags(campoClasse.value, campoTagsPreview);
    });

    document.getElementById("btn-revisar-cadastro").addEventListener("click", function() {
        const numero      = campoNumero.value.trim();
        const dataEntrada = campoData.value;
        const requerente  = campoRequerente.value.trim();
        const requerido   = campoRequerido.value.trim();
        const classe      = campoClasse.value;
        const conteudo    = campoConteudo.value.trim();

        if (!numero || !dataEntrada || !requerente || !requerido || !classe || !conteudo) {
            formErrorMsg.textContent = "Preencha todos os campos obrigatórios antes de continuar.";
            formError.style.display  = "flex";
            return;
        }
        formError.style.display = "none";

        const prioridade = campoPrioridade.value;
        const labels = { normal: "Normal", prioritario: "Prioritário", urgente: "Urgente" };

        confNumero.textContent     = numero;
        confData.textContent       = formatarData(dataEntrada);
        confRequerente.textContent = requerente;
        confRequerido.textContent  = requerido;
        confClasse.textContent     = classe;
        confPrioridade.textContent = labels[prioridade];
        confBadge.className        = `status-badge ${prioridade}`;
        confBadge.textContent      = labels[prioridade];

        const tags = TAGS_POR_CLASSE[classe] || ["Outros"];
        confTags.innerHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join("");

        confConteudo.textContent          = conteudo;
        confConteudoWrapper.style.display = "flex";

        const obs = campoObs.value.trim();
        if (obs) {
            confObs.textContent          = obs;
            confObsWrapper.style.display = "flex";
        } else {
            confObsWrapper.style.display = "none";
        }

        esconderTodasViews();
        getViewConfirmacao().style.display = "flex";
    });

    document.getElementById("btn-confirmar-cadastro").addEventListener("click", async function() {
        try {
            const classe = campoClasse.value;
            const tagsNomes = TAGS_POR_CLASSE[classe] || ["Outros"];

            // Buscar todas as tags da API para converter nomes -> ids
            const todasTags = await listarTags();
            const tagIds = tagsNomes
                .map(nome => todasTags.find(t => t.nome === nome)?.id)
                .filter(Boolean);

            const novoProcesso = {
                numero:          campoNumero.value.trim(),
                data_entrada:    campoData.value,
                requerente:      campoRequerente.value.trim(),
                cpf_requerente:  campoCpf.value.trim(),
                requerido:       campoRequerido.value.trim(),
                cpf_requerido:   campoCpfRequerido.value.trim(),
                assunto:         classe,
                status:          campoPrioridade.value,
                repetitivos:     0,
                conteudo:        campoConteudo.value.trim(),
                observacoes:     campoObs.value.trim(),
                tag_ids:         tagIds
            };

            await criarProcesso(novoProcesso);
            await renderizarFila();

            // limpar formulário
            campoNumero.value        = "";
            campoData.value          = "";
            campoRequerente.value    = "";
            campoCpf.value           = "";
            campoRequerido.value     = "";
            campoCpfRequerido.value  = "";
            campoClasse.value        = "";
            campoPrioridade.value    = "normal";
            campoConteudo.value      = "";
            campoObs.value           = "";
            atualizarPreviewTags("", campoTagsPreview);

            navItems.forEach(link => link.classList.remove("active"));
            document.querySelector('[data-section="triagem"]').classList.add("active");
            voltarParaFila();
            mostrarToast("Processo cadastrado e incluído na fila com sucesso!");
        } catch (e) {
            mostrarToast("Erro: " + e.message, "erro");
        }
    });

    document.getElementById("btn-editar-cadastro").addEventListener("click", () => {
        esconderTodasViews();
        getViewCadastro().style.display = "flex";
        document.body.classList.add("modo-cadastro");
    });

    document.getElementById("btn-cancelar-cadastro").addEventListener("click", () => {
        navItems.forEach(link => link.classList.remove("active"));
        document.querySelector('[data-section="triagem"]').classList.add("active");
        voltarParaFila();
    });
}
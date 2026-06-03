import { carregarFragmentos } from "./utils/loadViews.js";
import { abrirProcesso, voltarParaFila, renderizarFila, filtrarFilaPorStatus } from "./views/documento.js";
import { mostrarSecaoGenerica } from "./views/generica.js";

async function init() {

  await carregarFragmentos();

  // importa upload.js SÓ AQUI, após o DOM estar pronto
  const { mostrarUpload, registrarEventosUpload } = await import("./views/upload.js");
  registrarEventosUpload();

  // importa cadastro.js SÓ AQUI, após o DOM estar pronto
  const { mostrarCadastro, registrarEventos } = await import("./views/cadastro.js");
  registrarEventos();

  // carrega os processos do banco via API e monta os cards da fila
  await renderizarFila();

  // card "Alertas" no ai-panel: clica → filtra fila por urgentes e navega para Triagem
const cardAlertas = document.getElementById("card-alertas-urgentes");
if (cardAlertas) {
    const acionarFiltroUrgentes = () => {
        document.querySelectorAll(".nav-item").forEach(link => link.classList.remove("active"));
        document.querySelector('[data-section="triagem"]').classList.add("active");
        voltarParaFila();
        filtrarFilaPorStatus("urgente");
    };
    cardAlertas.addEventListener("click", acionarFiltroUrgentes);
    // acessibilidade: Enter e Espaço também acionam
    cardAlertas.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            acionarFiltroUrgentes();
        }
    });
}

  // tela inicial: Upload de PDF (Etapa 1)
  mostrarUpload();

  // botão voltar
  document.getElementById("btn-voltar")
    .addEventListener("click", voltarParaFila);

  // menu lateral
  document.querySelectorAll(".nav-item").forEach(function(item) {
    item.addEventListener("click", function(event) {
      event.preventDefault();
      document.querySelectorAll(".nav-item")
        .forEach(link => link.classList.remove("active"));
      item.classList.add("active");
      const secao = item.getAttribute("data-section");

      if (secao === "upload")        mostrarUpload();
      else if (secao === "triagem")  voltarParaFila();
      else if (secao === "cadastrar") mostrarCadastro();
      else                           mostrarSecaoGenerica(secao);
    });
  });

  document.getElementById("btn-voltar-generica")
    .addEventListener("click", function () {
      document.querySelectorAll(".nav-item")
        .forEach(link => link.classList.remove("active"));
      document.querySelector('[data-section="triagem"]').classList.add("active");
      voltarParaFila();
    });
}

init();
// ================= COMUNICAÇÃO COM A API CELERIS =================

const API = "http://localhost:3000";

export async function listarProcessos() {
    const r = await fetch(`${API}/processos`);
    if (!r.ok) throw new Error("Falha ao carregar processos");
    return r.json();
}

export async function buscarProcesso(id) {
    const r = await fetch(`${API}/processos/${id}`);
    if (!r.ok) throw new Error("Processo não encontrado");
    return r.json();
}

export async function criarProcesso(dados) {
    const r = await fetch(`${API}/processos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
    if (!r.ok) {
        const erro = await r.json();
        throw new Error(erro.erro || "Falha ao cadastrar processo");
    }
    return r.json();
}

export async function listarTags() {
    const r = await fetch(`${API}/tags`);
    if (!r.ok) throw new Error("Falha ao carregar tags");
    return r.json();
}

export async function atualizarProcesso(id, dados) {
    const r = await fetch(`${API}/processos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
    if (!r.ok) {
        const erro = await r.json();
        throw new Error(erro.erro || "Falha ao atualizar processo");
    }
    return r.json();
}

export async function deletarProcesso(id) {
    const r = await fetch(`${API}/processos/${id}`, { method: "DELETE" });
    if (!r.ok) {
        let msg = "Falha ao excluir processo";
        try {
            const erro = await r.json();   // erro normalmente vem com { erro: "..." }
            msg = erro.erro || msg;
        } catch { /* algumas respostas de erro podem não ter corpo */ }
        throw new Error(msg);
    }
    return true;   // 204 = sucesso sem conteúdo
}
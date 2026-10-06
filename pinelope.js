const fs = require('fs');
const path = require('path');

let geradorIA;
const diretorioServidor = __dirname;

const caminhoPrompt = path.join(diretorioServidor, 'prompt.txt');
const caminhoConfigSub = path.join(diretorioServidor, 'conf.sub15');
const caminhoJsonLog = path.join(diretorioServidor, 'subscript.json');

// CORREÇÃO MÁXIMA: Garante o travamento do CMD logo no início do arquivo
// Mesmo que tudo dê errado abaixo, o Node NÃO vai fechar a janela
setInterval(() => {}, 3600000);

function lerConfiguracaoSub15() {
    if (!fs.existsSync(caminhoConfigSub)) {
        return "Modo padrão: Servidor SA-MP (PAWN).";
    }
    const conteudo = fs.readFileSync(caminhoConfigSub, 'utf-8');
    return conteudo.split('\n').filter(line => line.trim() && !line.startsWith('#')).join(' | ');
}

async function iniciarPinelope() {
    console.log("==========================================================");
    console.log("🔍 CARREGANDO INTELIGÊNCIA ARTIFICIAL NEURAL OFFLINE...    ");
    console.log("==========================================================");
    
    try {
        // Importação dinâmica protegida para evitar travamento de CommonJS/ESM
        const transformers = await import('@xenova/transformers');
        const pipeline = transformers.pipeline;
        
        console.log("⏳ Inicializando modelo Qwen (Aguarde alguns segundos)...");
        geradorIA = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat'); 
        
        console.log("\n🤖 PINELLOPE.JS ASSÍNCRONA ONLINE!");
        console.log("📝 COMO USAR: Escreva sua ordem dentro do arquivo 'prompt.txt' e salve.");
        console.log("🔄 Monitorando alterações continuamente...");
        console.log("==========================================================\n");

    } catch (err) {
        console.log("\n❌ [ERRO DE DIAGNÓSTICO DA PINELLOPE]:");
        console.log("O script falhou ao carregar a IA interna.");
        console.log("Motivo do erro:", err.message);
        console.log("Abaixo está a pilha de travamento para investigação:\n");
        console.error(err);
        console.log("\n==========================================================");
        console.log("⚠️ A janela foi segurada aberta pelo sistema de emergência.");
        return; // Para a execução mas NÃO fecha o CMD
    }
    
    if (!fs.existsSync(caminhoPrompt)) {
        fs.writeFileSync(caminhoPrompt, "");
    }

    fs.watchFile(caminhoPrompt, { interval: 1000 }, async (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
            await verificarEProcessarPrompt();
        }
    });
}

async function verificarEProcessarPrompt() {
    if (!fs.existsSync(caminhoPrompt)) return;

    const promptUsuario = fs.readFileSync(caminhoPrompt, 'utf-8').trim();
    if (promptUsuario.length < 5) return;

    console.log(`\n🔔 [DETECTADO]: Nova ordem encontrada no prompt.txt!`);
    const regrasSub15 = lerConfiguracaoSub15();

    const mensagensChat = [
        { role: 'system', content: `Você é a Pinelope.js, uma IA especialista em programação de servidores SA-MP e MTA. Diretrizes: ${regrasSub15}. Retorne APENAS o código fonte limpo.` },
        { role: 'user', content: promptUsuario }
    ];

    try {
        if (!geradorIA) {
            console.log("❌ Erro: O motor de IA não está carregado corretamente.");
            return;
        }

        const resultado = await geradorIA(mensagensChat, { max_new_tokens: 1200, temperature: 0.3 });
        
        let codigoGerado = "";
        if (Array.isArray(resultado) && resultado[0] && resultado[0].generated_text) {
            codigoGerado = resultado[0].generated_text;
        } else if (resultado && resultado.generated_text) {
            codigoGerado = resultado.generated_text;
        } else {
            codigoGerado = String(resultado);
        }

        const pastaFS = path.join(diretorioServidor, 'filterscripts');
        if (!fs.existsSync(pastaFS)) fs.mkdirSync(pastaFS);

        const nomeArquivo = `pinelope_build_${Date.now()}.pwn`;
        const caminhoFinal = path.join(pastaFS, nomeArquivo);

        fs.writeFileSync(caminhoFinal, codigoGerado);
        console.log(`🛠️  [CÓDIGO GERADO]: Salvo em filterscripts/${nomeArquivo}`);

        try {
            delete require.cache[require.resolve('./corretor_bugs.js')];
            require('./corretor_bugs.js');
        } catch (errCorretor) {
            console.error("⚠️ Erro no Corretor:", errCorretor.message);
        }

        fs.writeFileSync(caminhoPrompt, "");
        console.log("✅ [CONCLUÍDO]: Processo finalizado!");

    } catch (err) {
        console.error("❌ Erro durante o pipeline:", err.message);
    }
}

// Inicializa o processo protegido
iniciarPinelope();

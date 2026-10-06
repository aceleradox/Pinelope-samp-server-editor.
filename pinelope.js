const fs = require('fs');
const path = require('path');

let geradorIA;
const diretorioServidor = __dirname;

const caminhoPrompt = path.join(diretorioServidor, 'prompt.txt');
const caminhoConfigSub = path.join(diretorioServidor, 'conf.sub15');
const caminhoJsonLog = path.join(diretorioServidor, 'subscript.json');

// Mantém a janela ativa para diagnóstico mesmo após falhas
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
        const transformers = await import('@xenova/transformers');
        const pipeline = transformers.pipeline;
        
        console.log("⏳ Inicializando Motor Super Leve GPT2 Geral (Aguarde)...");
        
        // CORREÇÃO: Usando o modelo público sem travas de autorização
        geradorIA = await pipeline('text-generation', 'Xenova/gpt2'); 
        
        console.log("\n🤖 PINELLOPE.JS ASSÍNCRONA ONLINE!");
        console.log("📝 COMO USAR: Escreva sua ordem dentro do arquivo 'prompt.txt' e salve.");
        console.log("🔄 Monitorando alterações continuamente...");
        console.log("==========================================================\n");

    } catch (err) {
        console.log("\n❌ [ERRO DE CARREGAMENTO]:", err.message);
        return;
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

    const instrucaoCompleta = `Task: Write a clean code for SA-MP/MTA server based on these guidelines: ${regrasSub15}. User request: ${promptUsuario}. Output only code lines.`;

    try {
        if (!geradorIA) {
            console.log("❌ Erro: O motor de IA não está ativo.");
            return;
        }

        const resultado = await geradorIA(instrucaoCompleta, { max_new_tokens: 300, temperature: 0.3 });
        
        let codigoGerado = "";
        // Correção de extração do array padrão dos Transformers para GPT2
        if (Array.isArray(resultado) && resultado[0] && resultado[0].generated_text) {
            codigoGerado = resultado[0].generated_text;
        } else if (resultado && resultado.generated_text) {
            codigoGerado = resultado.generated_text;
        } else {
            codigoGerado = String(resultado);
        }

        // Limpa a instrução inicial do output
        codigoGerado = codigoGerado.replace(instrucaoCompleta, '').trim();

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
        console.log("✅ [CONCLUÍDO]: Processo finalizado com sucesso!");

    } catch (err) {
        console.error("❌ Erro durante o pipeline:", err.message);
    }
}

iniciarPinelope();

const fs = require('fs');
const path = require('path');

let geradorIA;
const diretorioServidor = __dirname;

// Caminhos dos arquivos de controle do ecossistema Pinelope
const caminhoPrompt = path.join(diretorioServidor, 'prompt.txt');
const caminhoConfigSub = path.join(diretorioServidor, 'conf.sub15');
const caminhoJsonLog = path.join(diretorioServidor, 'subscript.json');

// Função para carregar as diretrizes do arquivo conf.sub15
function lerConfiguracaoSub15() {
    if (!fs.existsSync(caminhoConfigSub)) {
        return "Modo padrão: Servidor SA-MP (PAWN).";
    }
    const conteudo = fs.readFileSync(caminhoConfigSub, 'utf-8');
    return conteudo.split('\n').filter(line => line.trim() && !line.startsWith('#')).join(' | ');
}

// Inicializa o motor de IA Offline
async function iniciarPinelope() {
    console.log("==========================================================");
    console.log("🔍 CARREGANDO INTELIGÊNCIA ARTIFICIAL NEURAL OFFLINE...    ");
    console.log("==========================================================");
    
    const { pipeline } = await import('@xenova/transformers');
    geradorIA = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat'); 
    
    // Garante que o arquivo prompt.txt exista para o usuário interagir
    if (!fs.existsSync(caminhoPrompt)) {
        fs.writeFileSync(caminhoPrompt, "");
    }

    console.log("\n🤖 PINELLOPE.JS ASSÍNCRONA ONLINE!");
    console.log("📝 COMO USAR: Escreva sua ordem dentro do arquivo 'prompt.txt' e salve.");
    console.log("Pinelope irá ler o arquivo, gerar o código e aplicar o Corretor de Bugs.\n");
    console.log("🔄 Monitorando alterações no arquivo 'prompt.txt'...");
    console.log("==========================================================\n");

    // Inicia o observador automático de arquivos (File Watcher)
    fs.watchFile(caminhoPrompt, { interval: 1000 }, async (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
            await verificarEProcessarPrompt();
        }
    });
}

// Processador Inteligente baseado no prompt.txt
async function verificarEProcessarPrompt() {
    const promptUsuario = fs.readFileSync(caminhoPrompt, 'utf-8').trim();

    if (promptUsuario.length < 5) return; // Ignora se o arquivo estiver vazio ou muito curto

    console.log(`\n🔔 [DETECTADO]: Nova ordem encontrada no prompt.txt!`);
    console.log(`💬 Comando: "${promptUsuario.substring(0, 60)}..."`);

    const regrasSub15 = lerConfiguracaoSub15();

    const promptIA = `
    Você é a Pinelope.js, uma IA especialista em programação de servidores SA-MP e MTA.
    Gere o código correspondente seguindo estritamente as regras de arquitetura fornecidas.
    
    Diretrizes do Servidor (conf.sub15): ${regrasSub15}
    Instrução do Usuário: ${promptUsuario}
    
    Retorne APENAS o código fonte limpo e pronto, sem usar marcações de Markdown (como \`\`\`pawn ou \`\`\`), sem comentários explicativos e sem introduções.`;

    try {
        const resultado = await geradorIA(promptIA, { max_new_tokens: 1200, temperature: 0.3 });
        let codigoGerado = resultado[0].generated_text.replace(promptIA, '').trim();

        // Determina onde salvar baseado nas regras do conf.sub15
        const pastaFS = path.join(diretorioServidor, 'filterscripts');
        if (!fs.existsSync(pastaFS)) fs.mkdirSync(pastaFS);

        // Gera um nome único para o script não sobrescrever arquivos antigos
        const idUnico = Date.now();
        const nomeArquivo = `pinelope_build_${idUnico}.pwn`;
        const caminhoFinal = path.join(pastaFS, nomeArquivo);

        // Salva o código cru gerado pela IA
        fs.writeFileSync(caminhoFinal, codigoGerado);
        console.log(`🛠️  [CÓDIGO GERADO]: Salvo em filterscripts/${nomeArquivo}`);

        // 🔥 VALIDAÇÃO E CORREÇÃO DE SINTAXE AUTOMÁTICA
        console.log("🛡️  [CORRETOR]: Acionando varredura automatizada do 'corretor_bugs.js'...");
        require('./corretor_bugs.js');

        // 📋 GRAVAÇÃO DO LOG NO subscript.json
        atualizarLogJson(promptUsuario, nomeArquivo);

        // Limpa o arquivo prompt.txt para que ele fique pronto para a próxima ordem
        fs.writeFileSync(caminhoPrompt, "");
        console.log("✅ [CONCLUÍDO]: Processo finalizado! O arquivo 'prompt.txt' foi limpo e está pronto para receber novas funções.");
        console.log("\n🔄 Aguardando próxima alteração no 'prompt.txt'...");

    } catch (err) {
        console.error("❌ Erro durante o pipeline de desenvolvimento:", err.message);
    }
}

// Atualiza o banco de dados subscript.json com o histórico de criação
function atualizarLogJson(promptOriginal, arquivoGerado) {
    if (!fs.existsSync(caminhoJsonLog)) return;

    try {
        let dadosJson = JSON.parse(fs.readFileSync(caminhoJsonLog, 'utf-8'));
        dadosJson.ultima_modificacao = new Date().toISOString();
        dadosJson.historico_scripts.push({
            data: dadosJson.ultima_modificacao,
            prompt: promptOriginal,
            arquivo: arquivoGerado
        });

        fs.writeFileSync(caminhoJsonLog, JSON.stringify(dadosJson, null, 2));
        console.log("💾 [LOG]: Registro atualizado com sucesso no arquivo 'subscript.json'.");
    } catch (e) {
        console.error("❌ Erro ao atualizar o subscript.json:", e.message);
    }
}

// Inicia o processo
iniciarPinelope();

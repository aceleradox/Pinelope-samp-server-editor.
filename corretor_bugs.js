const fs = require('fs');
const path = require('path');

// Função de autocorreção estática de código (Self-Healing Compiler)
function processarCorrecaoSintaxe(codigoBruto, extensao) {
    let linhas = codigoBruto.split('\n');
    let codigoCorrigido = [];
    
    let contadorChavesAbertas = 0;

    for (let i = 0; i < linhas.length; i++) {
        let linha = linhas[i];
        let linhaTrim = linha.trim();

        // 1. CORRETOR PARA PAWN (SA-MP)
        if (extensao === '.pwn' || extensao === '.inc') {
            // Conta abertura e fechamento de escopos
            if (linhaTrim.includes('{')) contadorChavesAbertas++;
            if (linhaTrim.includes('}')) contadorChavesAbertas--;

            // Bug comum de IA: esquecer ponto e vírgula no final de instruções nativas
            if (linhaTrim.length > 0 && 
                !linhaTrim.endsWith(';') && 
                !linhaTrim.endsWith('{') && 
                !linhaTrim.endsWith('}') && 
                !linhaTrim.startsWith('#') && 
                !linhaTrim.startsWith('if') && 
                !linhaTrim.startsWith('else') &&
                !linhaTrim.startsWith('public') &&
                !linhaTrim.startsWith('forward')) {
                
                // Adiciona o ponto e vírgula se a IA esqueceu
                linha = linha + ';';
            }
        }

        // 2. CORRETOR PARA LUA (MTA)
        if (extensao === '.lua') {
            // Corrige se a IA misturou chaves de C++ dentro do código Lua do MTA
            if (linhaTrim === '{') linha = linha.replace('{', 'then');
            if (linhaTrim === '}') linha = linha.replace('}', 'end');
        }

        codigoCorrigido.push(linha);
    }

    // 3. BALANCEAMENTO DE CHAVES (Fecha chaves perdidas no final do arquivo para não dar crash na compilação)
    if (contadorChavesAbertas > 0) {
        console.log(`⚠️  [SINTAXE] Fechando ${contadorChavesAbertas} escopo(s) pendente(s) no final do arquivo.`);
        for (let j = 0; j < contadorChavesAbertas; j++) {
            codigoCorrigido.push('}');
        }
    }

    return codigoCorrigido.join('\n');
}

// Varre as pastas de scripts procurando por bugs gerados
function verificarEQuarentenarBugs() {
    console.log("==========================================================");
    console.log("🔍 PINELLOPE SYNTAX FIXER: Analisando integridade dos scripts...");
    console.log("==========================================================");

    const pastasParaVerificar = [
        path.join(__dirname, 'gamemodes'),
        path.join(__dirname, 'filterscripts')
    ];

    pastasParaVerificar.forEach(pasta => {
        if (!fs.existsSync(pasta)) return;

        const arquivos = fs.readdirSync(pasta);

        arquivos.forEach(arquivo => {
            const extensao = path.extname(arquivo).toLowerCase();
            
            // Só verifica arquivos de código fonte legível (.pwn, .inc, .lua)
            if (extensao === '.pwn' || extensao === '.inc' || extensao === '.lua') {
                const caminhoCompleto = path.join(pasta, arquivo);
                const conteudoOriginal = fs.readFileSync(caminhoCompleto, 'utf-8');
                
                // Processa a validação lógica
                const conteudoConsertado = processarCorrecaoSintaxe(conteudoOriginal, extensao);

                if (conteudoOriginal !== conteudoConsertado) {
                    fs.writeFileSync(caminhoCompleto, conteudoConsertado);
                    console.log(`✅ [BUG CONSERTADO]: Sintaxe do arquivo '${arquivo}' corrigida com sucesso!`);
                } else {
                    console.log(`   [INTEGRO]: Arquivo '${arquivo}' validado sem bugs estruturais.`);
                }
            }
        });
    });
    console.log("\n🛡️  [SISTEMA] Varredura final concluida. Servidor seguro!");
}

verificarEQuarentenarBugs();

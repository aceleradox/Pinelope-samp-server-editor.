# 🤖 Pinelope.js - Gerenciador & Desenvolvedor de Servidores Inteligente (IA Offline)

A **Pinelope.js** é um ecossistema de desenvolvimento automatizado focado em engenharia reversa, criação de scripts e gerência DevOps para servidores **SA-MP (PAWN)** e **MTA (Lua)**. 

O sistema opera de forma **100% offline e assíncrona**, utilizando Inteligência Artificial local (através de modelos generativos neurais da Hugging Face) combinada com um monitor de arquivos (*File Watcher*) e um corretor de sintaxe estático (*Self-Healing Fixer*). Você não precisa de chaves de API pagas e nem interagir diretamente com linhas de comando complexas no terminal.

---

## 📁 Estrutura do Ecossistema

O projeto é composto por 5 arquivos principais trabalhando em sincronia na raiz do seu servidor:

1. **`pinelope.js`:** O cérebro do sistema. Monitora o arquivo de ordens, gerencia a IA e roteia o código para as pastas certas.
2. **`corretor_bugs.js`:** O analisador estático. Varre o código gerado no final do processo para corrigir falta de pontos e vírgulas, fechar chaves de escopo (`{}`) abertas incorretamente ou traduzir comandos misturados de C++ para Lua.
3. **`prompt.txt`:** A sua interface de digitação. Escreva aqui o que deseja criar ou alterar e salve o arquivo.
4. **`conf.sub15`:** O arquivo de configuração de diretrizes. Diz à IA as especificações fixas do seu servidor (Ex: versão do PAWN, Includes base como `zcmd`, etc.).
5. **`subscript.json`:** O banco de dados e registro de logs. Salva o histórico completo de todas as alterações feitas para evitar duplicações de código.

---

## 🛠️ Instalação Automática

Não é necessário instalar os módulos manualmente por terminal. Desenvolvemos um inicializador inteligente em lote:

1. Certifique-se de ter o [Node.js](https://nodejs.org) instalado no seu Windows.
2. Na raiz da pasta do seu servidor, execute o arquivo **`start.bat`** (ou `instalar_e_rodar.bat`) com dois cliques.
3. O script `.bat` verificará o ambiente, criará o `package.json`, instalará os pacotes pesados (`@xenova/transformers` e `express`) de forma silenciosa e ligará a Pinelope.

---

## 🚀 Como Usar (Fluxo Perfeito)

Assim que a janela do prompt exibir a mensagem `🤖 PINELLOPE.JS ASSÍNCRONA ONLINE!`, o sistema estará pronto:

1. Abra o arquivo **`prompt.txt`** em seu editor de texto (como o VS Code).
2. Escreva o que você deseja criar ou alterar no servidor. 
   - *Exemplo de prompt:* `Crie um comando simples chamado /reparar em PAWN que conserte o veículo do jogador e cobre $500.`
3. **Salve o arquivo (`Ctrl + S`)**.

### 🔄 O que acontece nos bastidores em 1 segundo:
- O monitor de arquivos identifica o salvamento do `prompt.txt`.
- A Pinelope lê a instrução e as diretrizes do `conf.sub15`.
- A IA gera o código limpo e o compila dentro de um arquivo único na pasta `filterscripts/` ou `gamemodes/`.
- O `corretor_bugs.js` limpa a sintaxe do arquivo gerado para garantir que a compilação não dê crash.
- O histórico é registrado de forma estruturada no `subscript.json`.
- O arquivo `prompt.txt` é limpo automaticamente, ficando em branco e pronto para a sua próxima ordem!

---

## 🛡️ Segurança e Estabilidade de Código

Para evitar as falhas comuns de IAs convencionais que geram códigos inválidos que quebram o compilador (`pawncc` ou interpretador do MTA), a Pinelope executa uma varredura pós-build que valida:
- **Ponto e vírgula (`;`):** Injeta o terminador nas instruções nativas de PAWN caso a IA esqueça.
- **Balanceamento de Chaves:** Conta e fecha chaves perdidas para evitar erros de escopo sem fim.
- **Transpilação MTA:** Garante que chaves acidentais vindas de lógica C++ sejam convertidas em blocos corretos de `then` e `end` em arquivos Lua.

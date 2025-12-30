# LotoWb

**Loto forte sorte aplicação web moderna e robusta desenvolvida com **Angular 17+** para auxiliar apostadores de loterias da Caixa. O aplicativo permite gerar palpites utilizando diferentes estratégias matemáticas e conferir resultados automaticamente, oferecendo uma interface intuitiva e responsiva.

---

## 🚀 Funcionalidades Principais

### 1. Suporte a Múltiplas Loterias
O sistema suporta as principais modalidades de loteria do Brasil, cada uma com sua identidade visual e regras específicas:
*   **Mega Sena**
*   **Lotofácil**
*   **Quina**
*   **Lotomania**
*   **Dupla Sena**
*   **Dia de Sorte** (incluindo Mês de Sorte)
*   **Super Sete** (aposta por colunas)
*   **+Milionária** (números + trevos)

### 2. Modos de Geração de Jogos
O aplicativo oferece três estratégias poderosas para criação de jogos:

*   **🎲 Modo Aleatório**: Gera palpites rápidos baseados em sorteios aleatórios simples, ideal para quem quer apenas "tentar a sorte" sem complicações.
*   **🔢 Modo Combinações**: Permite selecionar um grupo maior de números e gerar *todas* as combinações possíveis entre eles.
*   **🔒 Modo Fechamento**: Uma estratégia avançada que permite jogar com mais números gastando menos. Garante uma premiação mínima (ex: Quadra ou Quina) caso as dezenas sorteadas estejam dentro do seu conjunto de números escolhidos.

### 3. Conferência de Resultados Automática
Integração direta com API de resultados para conferência em tempo real:
*   **Busca Automática**: Ao abrir a conferência, o sistema busca o último concurso disponível.
*   **Busca por Concurso**: Possibilidade de conferir jogos contra concursos passados específicos.
*   **Feedback Visual Imediato**:
    *   As dezenas acertadas são destacadas no volante.
    *   Contadores de acertos (Badges) indicam o desempenho de cada jogo (ex: "4 acertos", "11 pontos").
    *   Suporte a regras especiais: Acerto de Mês (Dia de Sorte), Trevos (+Milionária) e Colunas (Super Sete).

### 4. Exportação e Impressão
*   **📄 Exportar PDF**: Gere um arquivo PDF organizado com todos os seus jogos gerados, pronto para impressão ou para levar à lotérica.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as melhores práticas de desenvolvimento web moderno:

*   **Angular 17+**: Framework principal, utilizando a nova arquitetura de **Standalone Components**.
*   **TypeScript**: Para tipagem estática e segurança do código.
*   **SCSS**: Estilização modular e responsiva, com temas de cores específicos para cada loteria.
*   **RxJS**: Manipulação reativa de eventos e chamadas de API.
*   **jsPDF**: Biblioteca para geração de documentos PDF no lado do cliente.
*   **Loterias Caixa API**: Integração para busca de resultados oficiais.

---

## 📦 Como Rodar o Projeto

Siga os passos abaixo para executar a aplicação em seu ambiente local:

### Pré-requisitos
*   Node.js instalado (versão 18 ou superior recomendada).
*   Angular CLI instalado globalmente.

### Instalação

1.  Clone o repositório (ou baixe os arquivos):
    ```bash
    git clone https://github.com/lucianosan/loto-forte-sorte.git
    cd loto-forte-sorte
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Inicie o servidor de desenvolvimento:
    ```bash
    ng serve
    ```

4.  Acesse a aplicação no navegador:
    Abra `http://localhost:4200/`. A aplicação será recarregada automaticamente se você alterar qualquer arquivo de origem.

---

## 📱 Responsividade

O **Loto Forte Sorte** foi desenhado para funcionar perfeitamente em qualquer dispositivo, desde desktops até smartphones e tablets, adaptando o layout para oferecer a melhor experiência de uso em qualquer tamanho de tela.

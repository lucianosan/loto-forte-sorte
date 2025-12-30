# Loto Forte Sorte 🍀

Uma aplicação web moderna desenvolvida em Angular para geração, conferência e gerenciamento de jogos de loteria e bolões.

## 🚀 Funcionalidades

### 🎲 Jogos Suportados
O sistema suporta a geração e conferência das principais loterias da Caixa:
- Mega Sena
- Lotofácil
- Quina
- Lotomania
- Dupla Sena
- Dia de Sorte
- Super Sete
- +Milionária

### 🛠️ Ferramentas de Jogo
- **Geração Aleatória**: Criação de palpites baseados em aleatoriedade.
- **Fechamentos**: Algoritmos para criar jogos com garantias matemáticas de acerto.
- **Conferência Automática**: Verificação de resultados através da integração com API de loterias.

### 🏢 Área Administrativa de Bolões (Novo)
Funcionalidade exclusiva para gestão de bolões:
- **Criação de Bolões**: Geração de múltiplos jogos para venda em cotas.
- **Verificação Histórica**: Validação instantânea se os jogos gerados já foram premiados em concursos passados.
  - Exibição visual dos acertos (cartão de loteria).
  - Detalhes de concurso e data da premiação.
- **Publicação**: Disponibilização automática dos bolões na página inicial.

### 🛒 Experiência do Usuário
- **Home Page**: Visualização de bolões disponíveis com indicadores de loteria.
- **Detalhes do Bolão**: Página dedicada com:
  - Resumo de cotas e valores.
  - Lista de todos os jogos do bolão.
  - Análise de estratégias utilizadas.
  - Simulação de compra (carrinho).

## 💻 Tecnologias

- **Angular 17+**: Framework principal com Standalone Components.
- **TypeScript**: Tipagem estática para maior segurança.
- **SCSS**: Estilização modular e responsiva com uso de variáveis CSS para temas.
- **RxJS**: Gerenciamento de estado reativo e chamadas assíncronas.

## 📦 Instalação e Execução

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Execute o servidor de desenvolvimento:**
   ```bash
   npm start
   ```
   Acesse `http://localhost:4200/`.

## 📱 Estrutura do Projeto

- `src/app/pages`: Componentes de página (Home, Admin, Jogos Específicos).
- `src/app/services`: Serviços para lógica de negócios (GameService, LotteryService, BolaoService).
- `src/app/shared`: Componentes reutilizáveis.

## ⚠️ Nota
Este projeto é para fins educacionais e de estudo sobre probabilidades e desenvolvimento web. Não realiza apostas reais na Caixa Econômica Federal.

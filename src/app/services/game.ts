import { Injectable } from '@angular/core';

export type GameType = 'MEGA_SENA' | 'LOTOFACIL' | 'QUINA' | 'LOTOMANIA' | 'DUPLA_SENA' | 'DIA_DE_SORTE' | 'SUPER_SETE' | 'MAIS_MILIONARIA';

export interface GameConfig {
  min: number;
  max: number;
  defaultPick: number;
  color: string;
  name: string;
  // Opcional para jogos especiais
  secondaryMin?: number;
  secondaryMax?: number;
  secondaryPick?: number;
  columns?: number; // Para Super Sete
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  
  private configs: Record<GameType, GameConfig> = {
    MEGA_SENA: { min: 1, max: 60, defaultPick: 6, color: '#209869', name: 'Mega Sena' },
    LOTOFACIL: { min: 1, max: 25, defaultPick: 15, color: '#930089', name: 'Lotofácil' },
    QUINA: { min: 1, max: 80, defaultPick: 5, color: '#260085', name: 'Quina' },
    LOTOMANIA: { min: 0, max: 99, defaultPick: 50, color: '#f78323', name: 'Lotomania' },
    DUPLA_SENA: { min: 1, max: 50, defaultPick: 6, color: '#be2f37', name: 'Dupla Sena' },
    DIA_DE_SORTE: { min: 1, max: 31, defaultPick: 7, color: '#cb852b', name: 'Dia de Sorte', secondaryMin: 1, secondaryMax: 12, secondaryPick: 1 },
    SUPER_SETE: { min: 0, max: 9, defaultPick: 1, columns: 7, color: '#a4c639', name: 'Super Sete' },
    MAIS_MILIONARIA: { min: 1, max: 50, defaultPick: 6, secondaryMin: 1, secondaryMax: 6, secondaryPick: 2, color: '#2e3092', name: '+Milionária' }
  };

  constructor() { }

  getConfig(type: GameType): GameConfig {
    return this.configs[type];
  }

  generateRandomGame(type: GameType, count: number = 1): number[][] {
    const config = this.configs[type];
    const games: number[][] = [];
    
    for (let i = 0; i < count; i++) {
      if (type === 'SUPER_SETE') {
        // Tratamento especial para Super Sete (7 colunas, 1 número cada)
        const game: number[] = [];
        for (let col = 0; col < (config.columns || 7); col++) {
          game.push(this.getRandomNumbers(config.min, config.max, 1)[0]);
        }
        games.push(game);
      } else if (type === 'MAIS_MILIONARIA') {
        // Números + Trevos (representados como números negativos ou anexados?)
        // Vamos anexá-los. Padrão 6 números + 2 trevos.
        // Ou melhor, retorná-los de uma forma que o componente entenda. 
        // Para simplificar aqui, retornaremos um array plano onde os 2 últimos são trevos.
        // MAS, uma ordenação simples os misturaria. 
        // Vamos armazenar Trevos como (Número + 1000) ou similar para distinguir?
        // Não, vamos manter simples: Os primeiros N são números, os últimos M são secundários.
        // O componente irá separá-los com base na configuração.
        const main = this.getRandomNumbers(config.min, config.max, config.defaultPick);
        const secondary = this.getRandomNumbers(config.secondaryMin!, config.secondaryMax!, config.secondaryPick!);
        // Marcar números secundários se necessário? 
        // Para +Milionária, os números são 1-50, trevos 1-6. Existe sobreposição.
        // Para evitar confusão em um array plano, podemos precisar de uma estrutura diferente.
        // Mas `number[][]` é a assinatura.
        // Vamos confiar no índice. Os primeiros 6 são principais, os próximos 2 são trevos.
        games.push([...main, ...secondary]);
      } else if (type === 'DIA_DE_SORTE') {
        const main = this.getRandomNumbers(config.min, config.max, config.defaultPick);
        const month = this.getRandomNumbers(config.secondaryMin!, config.secondaryMax!, config.secondaryPick!);
        games.push([...main, ...month]);
      } else {
        games.push(this.getRandomNumbers(config.min, config.max, config.defaultPick));
      }
    }
    
    return games;
  }

  // Gera um fechamento (Fechamento)
  // Garante que se o sorteio consistir em 'k' números de 'numbers',
  // pelo menos um jogo no resultado terá 'guarantee' acertos.
  generateClosure(numbers: number[], k: number, guarantee: number): number[][] {
    // 1. Gera todos os jogos possíveis de tamanho k a partir dos números selecionados
    // Estes representam todos os "resultados" possíveis que podem ocorrer dentro da nossa seleção.
    let possibleResults = this.generateCombinations(numbers, k);
    
    const finalGames: number[][] = [];
    
    // Algoritmo guloso
    while (possibleResults.length > 0) {
      // Escolhe o primeiro como um bilhete
      const ticket = possibleResults[0];
      finalGames.push(ticket);
      
      // Remove todos os resultados que são cobertos por este bilhete
      // Um resultado é coberto se compartilha >= 'guarantee' números com o bilhete
      possibleResults = possibleResults.filter(result => {
        const matches = this.countMatches(ticket, result);
        return matches < guarantee;
      });
    }
    
    return finalGames;
  }

  private countMatches(a: number[], b: number[]): number {
    let count = 0;
    let i = 0;
    let j = 0;
    
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) {
        count++;
        i++;
        j++;
      } else if (a[i] < b[j]) {
        i++;
      } else {
        j++;
      }
    }
    return count;
  }

  // Generates all combinations of size 'k' from the input array 'numbers'
  generateCombinations(numbers: number[], k: number): number[][] {
    if (k > numbers.length || k <= 0) {
      return [];
    }
    
    if (k === numbers.length) {
      return [numbers.sort((a, b) => a - b)];
    }
    
    if (k === 1) {
      return numbers.map(n => [n]);
    }
    
    const combinations: number[][] = [];
    
    // Algorithm to generate combinations
    const helper = (start: number, currentCombo: number[]) => {
      if (currentCombo.length === k) {
        combinations.push([...currentCombo].sort((a, b) => a - b));
        return;
      }
      
      for (let i = start; i < numbers.length; i++) {
        currentCombo.push(numbers[i]);
        helper(i + 1, currentCombo);
        currentCombo.pop();
      }
    };
    
    helper(0, []);
    return combinations;
  }

  private getRandomNumbers(min: number, max: number, count: number): number[] {
    const numbers = new Set<number>();
    
    while (numbers.size < count) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      numbers.add(num);
    }
    
    return Array.from(numbers).sort((a, b) => a - b);
  }
}

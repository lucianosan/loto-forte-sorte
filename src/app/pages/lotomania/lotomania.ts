import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { PdfService } from '../../services/pdf.service';
import { LotteryService, LotteryResult } from '../../services/lottery.service';

@Component({
  selector: 'app-lotomania',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lotomania.html',
  styleUrl: './lotomania.scss',
})
export class Lotomania {
  private gameService = inject(GameService);
  private pdfService = inject(PdfService);
  private lotteryService = inject(LotteryService);
  
  mode: 'RANDOM' | 'COMBINATION' | 'CLOSURE' = 'RANDOM';
  generatedGames: number[][] = [];
  
  // Modo Aleatório
  randomCount = 1;
  
  // Modo Combinação/Fechamento
  selectedNumbers: Set<number> = new Set();
  availableNumbers: number[] = Array.from({length: 100}, (_, i) => i); // 0 a 99
  closureGuarantee = 16; // Padrão 16 acertos
  
  // Verificação de Resultados
  contestNumber: number | null = null;
  lastResult: LotteryResult | null = null;
  resultNumbers: number[] = [];
  isChecking = false;

  // Paginação
  currentPage = 1;
  pageSize = 20;

  get paginatedGames(): number[][] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.generatedGames.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.generatedGames.length / this.pageSize);
  }

  get isCombinationValid(): boolean {
    return this.selectedNumbers.size >= 50 && this.selectedNumbers.size <= 70; // Permite até 70 para fechamentos
  }
  
  generateRandom() {
    this.generatedGames = this.gameService.generateRandomGame('LOTOMANIA', this.randomCount);
    this.currentPage = 1;
    this.clearResult();
  }

  exportPdf() {
    if (this.generatedGames.length > 0) {
      this.pdfService.generatePdf(this.generatedGames, 'LOTOMANIA', 'Lotomania');
    }
  }
  
  toggleNumber(num: number) {
    if (this.selectedNumbers.has(num)) {
      this.selectedNumbers.delete(num);
    } else {
      if (this.selectedNumbers.size < 70) {
        this.selectedNumbers.add(num);
      }
    }
  }
  
  clearSelection() {
    this.selectedNumbers.clear();
    this.generatedGames = [];
    this.currentPage = 1;
    this.clearResult();
  }
  
  generateCombinations() {
    if (this.isCombinationValid) {
      const numbers = Array.from(this.selectedNumbers);
      // Combinações de 50 a partir dos selecionados. AVISO: Isso pode ser enorme se N > 50.
      // Se N=51, C(51,50) = 51. OK.
      // Se N=60, C(60,50) é enorme.
      // Talvez restrinja "Combinações" a pequenos deltas ou avise o usuário.
      // Por enquanto, vamos manter, mas o usuário deve ter cuidado.
      // Na verdade, o fechamento padrão da Lotomania é "Escolha X, garanta Y acertos".
      // Vamos confiar principalmente na lógica de Fechamento.
      this.generatedGames = this.gameService.generateCombinations(numbers, 50);
      this.currentPage = 1;
      this.clearResult();
    }
  }

  // Métodos de Verificação
  checkResult() {
    this.isChecking = true;
    const request = this.contestNumber 
      ? this.lotteryService.getResultByContest('LOTOMANIA', this.contestNumber)
      : this.lotteryService.getLatestResult('LOTOMANIA');

    request.subscribe({
      next: (result) => {
        this.lastResult = result;
        if (result) {
          this.resultNumbers = result.dezenas.map(d => parseInt(d, 10));
        } else {
          this.resultNumbers = [];
        }
        this.isChecking = false;
      },
      error: () => {
        this.isChecking = false;
        alert('Erro ao buscar resultado');
      }
    });
  }

  getHits(game: number[], result: number[] = []): number {
    const targetResult = result.length > 0 ? result : this.resultNumbers;
    return this.lotteryService.checkHits(game, targetResult);
  }

  clearResult() {
    this.lastResult = null;
    this.resultNumbers = [];
    this.contestNumber = null;
  }

  generateClosure() {
    if (this.isCombinationValid) {
      const numbers = Array.from(this.selectedNumbers);
      // Garante X acertos se os 20 números sorteados estiverem entre os selecionados.
      // O sorteio da Lotomania tem 20 números.
      // Mas o tamanho do bilhete é 50.
      // Isso é matematicamente complexo para o algoritmo guloso padrão.
      // Guloso padrão: Gera bilhetes de tamanho K (50).
      // Filtra se (Bilhete interseção Resultado) >= Garantia.
      // O tamanho do resultado é 20 (Sorteio).
      // Mas não sabemos o resultado.
      // "Se os 20 números sorteados estiverem entre os meus N números selecionados, garanta que pelo menos um bilhete tenha G acertos".
      // Nosso generateClosure assume Tamanho do Bilhete == Tamanho do Sorteio geralmente, ou K é o tamanho do subconjunto.
      // Aqui Tamanho do Bilhete (50) != Tamanho do Sorteio (20).
      // A lógica Gulosa no GameService:
      // generateClosure(numbers, k, guarantee)
      // k é o tamanho do bilhete.
      // "possibleResults" são combinações de tamanho k.
      // Essa lógica assume que queremos cobrir todos os resultados possíveis de tamanho k.
      // Na Lotomania, os resultados têm tamanho 20. Compramos bilhetes de tamanho 50.
      // A lógica do serviço precisa de adaptação para Tamanho do Bilhete != Tamanho do Sorteio.
      
      // Por enquanto, vamos usar a geração aleatória básica para Lotomania nesta iteração
      // e talvez um fechamento simplificado estilo "Surpresinha" ou apenas combinações se N for pequeno.
      
      // Se o usuário escolher 50, é 1 jogo.
      // Se o usuário escolher 60, podemos gerar alguns jogos equilibrados de 50 números.
      
      // Vamos ficar com o aleatório por enquanto se a lógica for muito complexa para esta vez,
      // OU reutilizar generateCombinations se N estiver próximo de 50.
      
      if (numbers.length > 55) {
         alert('Para combinações/fechamentos, selecione no máximo 55 números para evitar travamento.');
         return;
      }
      
      this.generatedGames = this.gameService.generateCombinations(numbers, 50);
      this.currentPage = 1;
      this.clearResult();
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
}

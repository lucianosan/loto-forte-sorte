import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { PdfService } from '../../services/pdf.service';
import { LotteryService, LotteryResult } from '../../services/lottery.service';

@Component({
  selector: 'app-mais-milionaria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mais-milionaria.html',
  styleUrl: './mais-milionaria.scss',
})
export class MaisMilionaria {
  private gameService = inject(GameService);
  private pdfService = inject(PdfService);
  private lotteryService = inject(LotteryService);
  
  mode: 'RANDOM' | 'COMBINATION' | 'CLOSURE' = 'RANDOM';
  generatedGames: number[][] = [];
  
  // Result checking
  contestNumber: number | null = null;
  lastResult: LotteryResult | null = null;
  resultNumbers: number[] = [];
  resultTrevos: number[] = [];
  isChecking = false;

  // Modo Aleatório
  randomCount = 1;
  
  // Modo Combinação/Fechamento
  selectedNumbers: Set<number> = new Set();
  selectedTrevos: Set<number> = new Set();
  
  availableNumbers: number[] = Array.from({length: 50}, (_, i) => i + 1);
  availableTrevos: number[] = [1, 2, 3, 4, 5, 6];
  
  closureGuarantee = 4; // Padrão Quadra
  
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
    return this.selectedNumbers.size >= 6 && this.selectedNumbers.size <= 12 &&
           this.selectedTrevos.size >= 2 && this.selectedTrevos.size <= 6;
  }
  
  generateRandom() {
    this.clearResult();
    this.generatedGames = this.gameService.generateRandomGame('MAIS_MILIONARIA', this.randomCount);
    this.currentPage = 1;
  }
  
  toggleNumber(num: number) {
    if (this.selectedNumbers.has(num)) {
      this.selectedNumbers.delete(num);
    } else {
      if (this.selectedNumbers.size < 12) {
        this.selectedNumbers.add(num);
      }
    }
  }

  toggleTrevo(num: number) {
    if (this.selectedTrevos.has(num)) {
      this.selectedTrevos.delete(num);
    } else {
      if (this.selectedTrevos.size < 6) {
        this.selectedTrevos.add(num);
      }
    }
  }
  
  generateCombinations() {
    if (this.isCombinationValid) {
      this.clearResult();
      const numbers = Array.from(this.selectedNumbers);
      const trevos = Array.from(this.selectedTrevos);
      
      const numCombos = this.gameService.generateCombinations(numbers, 6);
      const trevoCombos = this.gameService.generateCombinations(trevos, 2);
      
      // Produto Cartesiano
      this.generatedGames = [];
      for (const n of numCombos) {
        for (const t of trevoCombos) {
          this.generatedGames.push([...n, ...t]);
        }
      }
      this.currentPage = 1;
    }
  }

  generateClosure() {
    if (this.isCombinationValid) {
      this.clearResult();
      const numbers = Array.from(this.selectedNumbers);
      const trevos = Array.from(this.selectedTrevos);
      
      // Fechamento nos Números
      const numClosures = this.gameService.generateClosure(numbers, 6, this.closureGuarantee);
      // Combinações nos Trevos (Sempre cobrir todos os pares de trevos para garantir, ou apenas aleatório?)
      // Abordagem padrão: Cobrir todos os pares de trevos para cada bilhete de número? Isso multiplica muito os bilhetes.
      // Ou apenas emparelhar 1 combinação de trevo por bilhete de número?
      // Vamos fazer o Produto Cartesiano para ser completo, os usuários querem garantias.
      const trevoCombos = this.gameService.generateCombinations(trevos, 2);
      
      this.generatedGames = [];
      for (const n of numClosures) {
        for (const t of trevoCombos) {
          this.generatedGames.push([...n, ...t]);
        }
      }
      this.currentPage = 1;
    }
  }
  
  clearSelection() {
    this.selectedNumbers.clear();
    this.selectedTrevos.clear();
    this.generatedGames = [];
    this.currentPage = 1;
    this.clearResult();
  }

  checkResult() {
    this.isChecking = true;
    const request = this.contestNumber 
      ? this.lotteryService.getResultByContest('MAIS_MILIONARIA', this.contestNumber)
      : this.lotteryService.getLatestResult('MAIS_MILIONARIA');

    request.subscribe({
      next: (result) => {
        this.lastResult = result;
        if (result) {
          this.resultNumbers = result.dezenas.map(d => parseInt(d, 10));
          this.resultTrevos = result.trevos ? result.trevos.map(t => parseInt(t, 10)) : [];
        } else {
          this.resultNumbers = [];
          this.resultTrevos = [];
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
    return this.lotteryService.checkHits(game.slice(0, 6), targetResult);
  }

  getTrevosHits(game: number[], result: number[] = []): number {
    const gameTrevos = game.slice(6, 8);
    const targetResult = result.length > 0 ? result : this.resultTrevos;
    return this.lotteryService.checkHits(gameTrevos, targetResult);
  }

  checkTrevoHit(trevo: number): boolean {
    return this.resultTrevos.includes(trevo);
  }

  clearResult() {
    this.lastResult = null;
    this.resultNumbers = [];
    this.resultTrevos = [];
    this.contestNumber = null;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  exportPdf() {
    if (this.generatedGames.length > 0) {
      this.pdfService.generatePdf(this.generatedGames, 'MAIS_MILIONARIA', '+Milionária');
    }
  }
}

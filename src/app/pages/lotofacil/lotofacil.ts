import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { PdfService } from '../../services/pdf.service';
import { LotteryService, LotteryResult } from '../../services/lottery.service';

@Component({
  selector: 'app-lotofacil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lotofacil.html',
  styleUrl: './lotofacil.scss',
})
export class Lotofacil {
  private gameService = inject(GameService);
  private pdfService = inject(PdfService);
  private lotteryService = inject(LotteryService);
  
  mode: 'RANDOM' | 'COMBINATION' | 'CLOSURE' = 'RANDOM';
  generatedGames: number[][] = [];
  
  // Modo Aleatório
  randomCount = 1;
  
  // Modo Combinação/Fechamento
  selectedNumbers: Set<number> = new Set();
  availableNumbers: number[] = Array.from({length: 25}, (_, i) => i + 1);
  closureGuarantee = 14;

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
    return this.selectedNumbers.size >= 15 && this.selectedNumbers.size <= 18;
  }
  
  generateRandom() {
    this.generatedGames = this.gameService.generateRandomGame('LOTOFACIL', this.randomCount);
    this.currentPage = 1;
    this.clearResult();
  }

  exportPdf() {
    if (this.generatedGames.length > 0) {
      this.pdfService.generatePdf(this.generatedGames, 'LOTOFACIL', 'Lotofácil');
    }
  }
  
  toggleNumber(num: number) {
    if (this.selectedNumbers.has(num)) {
      this.selectedNumbers.delete(num);
    } else {
      if (this.selectedNumbers.size < 18) {
        this.selectedNumbers.add(num);
      }
    }
  }
  
  generateCombinations() {
    if (this.isCombinationValid) {
      const numbers = Array.from(this.selectedNumbers);
      this.generatedGames = this.gameService.generateCombinations(numbers, 15);
      this.currentPage = 1;
      this.clearResult();
    }
  }

  generateClosure() {
    if (this.isCombinationValid) {
      const numbers = Array.from(this.selectedNumbers);
      this.generatedGames = this.gameService.generateClosure(numbers, 15, this.closureGuarantee);
      this.currentPage = 1;
      this.clearResult();
    }
  }
  
  clearSelection() {
    this.selectedNumbers.clear();
    this.generatedGames = [];
    this.currentPage = 1;
    this.clearResult();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  // Lógica de Verificação
  checkResult() {
    this.isChecking = true;
    const request = this.contestNumber 
      ? this.lotteryService.getResultByContest('LOTOFACIL', this.contestNumber)
      : this.lotteryService.getLatestResult('LOTOFACIL');

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

  clearResult() {
    this.lastResult = null;
    this.resultNumbers = [];
  }

  getHits(game: number[], result: number[] = []): number {
    const targetResult = result.length > 0 ? result : this.resultNumbers;
    if (targetResult.length === 0) return 0;
    return this.lotteryService.checkHits(game, targetResult);
  }

  isMatched(num: number): boolean {
    return this.resultNumbers.includes(num);
  }
}

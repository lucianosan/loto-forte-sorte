import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { PdfService } from '../../services/pdf.service';
import { LotteryService, LotteryResult } from '../../services/lottery.service';

@Component({
  selector: 'app-dia-de-sorte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dia-de-sorte.html',
  styleUrl: './dia-de-sorte.scss',
})
export class DiaDeSorte {
  private gameService = inject(GameService);
  private pdfService = inject(PdfService);
  private lotteryService = inject(LotteryService);
  
  mode: 'RANDOM' | 'COMBINATION' | 'CLOSURE' = 'RANDOM';
  generatedGames: number[][] = [];
  
  // Result checking
  contestNumber: number | null = null;
  lastResult: LotteryResult | null = null;
  resultNumbers: number[] = [];
  isChecking = false;

  // Modo Aleatório
  randomCount = 1;
  
  // Modo Combinação/Fechamento
  selectedNumbers: Set<number> = new Set();
  availableNumbers: number[] = Array.from({length: 31}, (_, i) => i + 1);
  
  // Seleção de mês
  months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  selectedMonth: number | null = null; // 1-12
  
  closureGuarantee = 4; // Padrão Quadra (4 acertos)
  
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
    // 7 a 15 números + 1 mês necessários
    return this.selectedNumbers.size >= 7 && this.selectedNumbers.size <= 15 && this.selectedMonth !== null;
  }
  
  generateRandom() {
    this.clearResult();
    this.generatedGames = this.gameService.generateRandomGame('DIA_DE_SORTE', this.randomCount);
    this.currentPage = 1;
  }
  
  toggleNumber(num: number) {
    if (this.selectedNumbers.has(num)) {
      this.selectedNumbers.delete(num);
    } else {
      if (this.selectedNumbers.size < 15) {
        this.selectedNumbers.add(num);
      }
    }
  }

  selectMonth(monthIndex: number) {
    this.selectedMonth = monthIndex + 1; // 1-based
  }
  
  generateCombinations() {
    if (this.isCombinationValid) {
      this.clearResult();
      const numbers = Array.from(this.selectedNumbers);
      // Gera combinações de 7 números
      const combos = this.gameService.generateCombinations(numbers, 7);
      // Adiciona o mês selecionado a cada um
      this.generatedGames = combos.map(c => [...c, this.selectedMonth!]);
      this.currentPage = 1;
    }
  }

  generateClosure() {
    if (this.isCombinationValid) {
      this.clearResult();
      const numbers = Array.from(this.selectedNumbers);
      // Fechamento nos números
      const closures = this.gameService.generateClosure(numbers, 7, this.closureGuarantee);
      // Adiciona o mês selecionado
      this.generatedGames = closures.map(c => [...c, this.selectedMonth!]);
      this.currentPage = 1;
    }
  }
  
  clearSelection() {
    this.selectedNumbers.clear();
    this.selectedMonth = null;
    this.generatedGames = [];
    this.currentPage = 1;
    this.clearResult();
  }

  checkResult() {
    this.isChecking = true;
    const request = this.contestNumber 
      ? this.lotteryService.getResultByContest('DIA_DE_SORTE', this.contestNumber)
      : this.lotteryService.getLatestResult('DIA_DE_SORTE');

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

  getHits(game: number[], result: number[]): number {
    // First 7 numbers are the game numbers
    return this.lotteryService.checkHits(game.slice(0, 7), result);
  }

  checkMonthHit(game: number[]): boolean {
    if (!this.lastResult || !this.lastResult.mesSorte) return false;
    const monthIndex = game[7]; // Last element is month
    const monthName = this.months[monthIndex - 1];
    return monthName.toLowerCase() === this.lastResult.mesSorte.toLowerCase();
  }

  clearResult() {
    this.lastResult = null;
    this.resultNumbers = [];
    this.contestNumber = null;
  }

  exportPdf() {
    if (this.generatedGames.length > 0) {
      this.pdfService.generatePdf(this.generatedGames, 'DIA_DE_SORTE', 'Dia de Sorte');
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  
  getMonthName(index: number): string {
    return this.months[index - 1] || '';
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { PdfService } from '../../services/pdf.service';
import { LotteryService, LotteryResult } from '../../services/lottery.service';

@Component({
  selector: 'app-super-sete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-sete.html',
  styleUrl: './super-sete.scss',
})
export class SuperSete {
  private gameService = inject(GameService);
  private pdfService = inject(PdfService);
  private lotteryService = inject(LotteryService);
  
  mode: 'RANDOM' | 'MANUAL' = 'RANDOM'; // Modos simplificados para Super Sete
  generatedGames: number[][] = [];
  
  // Result checking
  contestNumber: number | null = null;
  lastResult: LotteryResult | null = null;
  resultNumbers: number[] = [];
  isChecking = false;

  // Modo Aleatório
  randomCount = 1;
  
  // Modo Manual (1 por coluna)
  columns = [0, 1, 2, 3, 4, 5, 6];
  numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // Armazena o índice do número selecionado para cada coluna (nulo se nenhum)
  selectedPerColumn: (number | null)[] = [null, null, null, null, null, null, null];
  
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

  get isSelectionComplete(): boolean {
    return this.selectedPerColumn.every(n => n !== null);
  }
  
  generateRandom() {
    this.clearResult();
    this.generatedGames = this.gameService.generateRandomGame('SUPER_SETE', this.randomCount);
    this.currentPage = 1;
  }
  
  selectNumber(colIndex: number, num: number) {
    if (this.selectedPerColumn[colIndex] === num) {
      this.selectedPerColumn[colIndex] = null;
    } else {
      this.selectedPerColumn[colIndex] = num;
    }
  }
  
  addManualGame() {
    if (this.isSelectionComplete) {
      this.clearResult();
      // Cria um jogo a partir da seleção atual
      const game = this.selectedPerColumn.map(n => n!);
      this.generatedGames = [game, ...this.generatedGames];
      this.currentPage = 1;
      // Opcional: limpar seleção ou manter? Manter para facilitar.
    }
  }
  
  clearSelection() {
    this.selectedPerColumn = [null, null, null, null, null, null, null];
    this.generatedGames = [];
    this.currentPage = 1;
    this.clearResult();
  }

  checkResult() {
    this.isChecking = true;
    const request = this.contestNumber 
      ? this.lotteryService.getResultByContest('SUPER_SETE', this.contestNumber)
      : this.lotteryService.getLatestResult('SUPER_SETE');

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
    // Super Sete is positional match
    return game.reduce((hits, num, index) => {
      return hits + (num === result[index] ? 1 : 0);
    }, 0);
  }

  checkColumnHit(game: number[], colIndex: number): boolean {
    if (!this.resultNumbers.length) return false;
    return game[colIndex] === this.resultNumbers[colIndex];
  }

  clearResult() {
    this.lastResult = null;
    this.resultNumbers = [];
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
      this.pdfService.generatePdf(this.generatedGames, 'SUPER_SETE', 'Super Sete');
    }
  }
}

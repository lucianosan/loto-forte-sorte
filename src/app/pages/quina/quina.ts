import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-quina',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quina.html',
  styleUrl: './quina.scss',
})
export class Quina {
  private gameService = inject(GameService);
  private pdfService = inject(PdfService);
  
  mode: 'RANDOM' | 'COMBINATION' | 'CLOSURE' = 'RANDOM';
  generatedGames: number[][] = [];
  
  // Modo Aleatório
  randomCount = 1;
  
  // Modo Combinação/Fechamento
  selectedNumbers: Set<number> = new Set();
  availableNumbers: number[] = Array.from({length: 80}, (_, i) => i + 1);
  closureGuarantee = 4;

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
    return this.selectedNumbers.size >= 5 && this.selectedNumbers.size <= 12;
  }
  
  generateRandom() {
    this.generatedGames = this.gameService.generateRandomGame('QUINA', this.randomCount);
    this.currentPage = 1;
    this.clearResult();
  }

  exportPdf() {
    if (this.generatedGames.length > 0) {
      this.pdfService.generatePdf(this.generatedGames, 'QUINA', 'Quina');
    }
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
  
  generateCombinations() {
    if (this.isCombinationValid) {
      const numbers = Array.from(this.selectedNumbers);
      this.generatedGames = this.gameService.generateCombinations(numbers, 5);
      this.currentPage = 1;
      this.clearResult();
    }
  }

  generateClosure() {
    if (this.isCombinationValid) {
      const numbers = Array.from(this.selectedNumbers);
      this.generatedGames = this.gameService.generateClosure(numbers, 5, this.closureGuarantee);
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

  // Métodos de Verificação
  checkResult() {
    this.isChecking = true;
    const request = this.contestNumber 
      ? this.lotteryService.getResultByContest('QUINA', this.contestNumber)
      : this.lotteryService.getLatestResult('QUINA');

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

  getHits(game: number[]): number {
    return this.lotteryService.checkHits(game, this.resultNumbers);
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
}

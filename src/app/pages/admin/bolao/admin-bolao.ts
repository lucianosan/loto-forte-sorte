import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../../services/game';
import { BolaoService, Bolao } from '../../../services/bolao.service';
import { LotteryService, LotteryResult } from '../../../services/lottery.service';

@Component({
  selector: 'app-admin-bolao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bolao.html',
  styleUrl: './admin-bolao.scss',
})
export class AdminBolao {
  private gameService = inject(GameService);
  private bolaoService = inject(BolaoService);
  private lotteryService = inject(LotteryService);

  // Form Fields
  lotteryType = 'MEGA_SENA';
  contestNumber: number | null = null;
  contestDate: string = new Date().toISOString().split('T')[0];
  totalShares = 10;
  pricePerShare = 10.0;
  chanceLabel = 'Alta';
  
  // Game Generation
  gamesCount = 10;
  generatedGames: number[][] = [];
  
  // Verification
  isVerifying = false;
  verificationResults: { 
    gameIndex: number, 
    game: number[],
    matches: {
      hits: number,
      contest: number,
      date: string,
      matchedNumbers: number[]
    }[] 
  }[] = [];

  lotteryTypes = [
    { value: 'MEGA_SENA', label: 'Mega Sena' },
    { value: 'LOTOFACIL', label: 'Lotofácil' },
    { value: 'QUINA', label: 'Quina' },
    { value: 'LOTOMANIA', label: 'Lotomania' },
    { value: 'DUPLA_SENA', label: 'Dupla Sena' },
    { value: 'DIA_DE_SORTE', label: 'Dia de Sorte' },
    { value: 'SUPER_SETE', label: 'Super Sete' },
    { value: 'MAIS_MILIONARIA', label: '+Milionária' }
  ];

  chanceOptions = ['Boa', 'Muito boa', 'Alta', 'Altíssima', 'Imperdível'];

  private minMatches: Record<string, number> = {
    'MEGA_SENA': 4,
    'LOTOFACIL': 11,
    'QUINA': 2,
    'LOTOMANIA': 15,
    'DUPLA_SENA': 3,
    'DIA_DE_SORTE': 4,
    'SUPER_SETE': 3,
    'MAIS_MILIONARIA': 2
  };

  generateGames() {
    // Mapping internal type names if needed, or ensuring GameService accepts these keys
    this.generatedGames = this.gameService.generateRandomGame(this.lotteryType as any, this.gamesCount);
    this.verificationResults = []; // Clear previous verification
  }

  verifyGames() {
    if (this.generatedGames.length === 0) {
      alert('Gere os jogos primeiro.');
      return;
    }

    this.isVerifying = true;
    this.verificationResults = [];

    this.lotteryService.getAllResults(this.lotteryType).subscribe({
      next: (results) => {
        if (!results || results.length === 0) {
          alert('Não foi possível obter o histórico de resultados para verificação.');
          this.isVerifying = false;
          return;
        }

        const minMatch = this.minMatches[this.lotteryType] || 0;

        this.generatedGames.forEach((game, index) => {
          const gameMatches: {
            hits: number,
            contest: number,
            date: string,
            matchedNumbers: number[]
          }[] = [];

          results.forEach(result => {
            // Parse result numbers
            const resultNumbers = result.dezenas.map(d => parseInt(d, 10));
            
            // Calculate intersection locally to get specific matched numbers
            const matchedNumbers = game.filter(n => resultNumbers.includes(n));
            const hits = matchedNumbers.length;

            if (hits >= minMatch) {
              gameMatches.push({
                hits,
                contest: result.concurso,
                date: result.data,
                matchedNumbers
              });
            }
          });

          if (gameMatches.length > 0) {
            this.verificationResults.push({
              gameIndex: index + 1,
              game: game,
              matches: gameMatches
            });
          }
        });

        if (this.verificationResults.length === 0) {
          alert('Nenhum dos jogos gerados foi premiado em concursos anteriores!');
        } else {
          alert(`Encontrados registros de premiação em ${this.verificationResults.length} jogos.`);
        }
        
        this.isVerifying = false;
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao verificar jogos.');
        this.isVerifying = false;
      }
    });
  }

  createBolao() {
    if (this.generatedGames.length === 0) {
      alert('Gere os jogos antes de criar o bolão.');
      return;
    }
    if (!this.contestNumber) {
      alert('Informe o número do concurso.');
      return;
    }

    const totalCost = this.pricePerShare * this.totalShares;
    
    const newBolao: Bolao = {
      id: Date.now().toString(),
      lotteryType: this.lotteryType,
      contestNumber: this.contestNumber,
      contestDate: this.contestDate,
      games: this.generatedGames,
      totalShares: this.totalShares,
      availableShares: this.totalShares,
      pricePerShare: this.pricePerShare,
      totalCost: totalCost,
      chanceLabel: this.chanceLabel,
      code: this.bolaoService.generateCode(this.lotteryType)
    };

    this.bolaoService.addBolao(newBolao);
    alert('Bolão criado com sucesso!');
    this.resetForm();
  }

  resetForm() {
    this.generatedGames = [];
    this.contestNumber = null;
    this.verificationResults = [];
    // Keep other defaults
  }
}

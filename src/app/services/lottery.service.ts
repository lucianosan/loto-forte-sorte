import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface LotteryResult {
  loteria: string;
  concurso: number;
  data: string;
  dezenas: string[];
  dezenas2?: string[]; // Para Dupla Sena (2º sorteio)
  trevos?: string[]; // Para +Milionária
  mesSorte?: string; // Para Dia de Sorte
}

@Injectable({
  providedIn: 'root'
})
export class LotteryService {
  private http = inject(HttpClient);
  private baseUrl = 'https://loteriascaixa-api.herokuapp.com/api';

  // Mapeamento de nomes internos para nomes da API
  private apiNames: Record<string, string> = {
    'MEGA_SENA': 'megasena',
    'LOTOFACIL': 'lotofacil',
    'QUINA': 'quina',
    'LOTOMANIA': 'lotomania',
    'DUPLA_SENA': 'duplasena',
    'DIA_DE_SORTE': 'diadesorte',
    'SUPER_SETE': 'supersete',
    'MAIS_MILIONARIA': 'maismilionaria'
  };

  getLatestResult(gameType: string): Observable<LotteryResult | null> {
    const apiName = this.apiNames[gameType];
    if (!apiName) return of(null);

    return this.http.get<LotteryResult>(`${this.baseUrl}/${apiName}/latest`).pipe(
      catchError(error => {
        console.error('Erro ao buscar resultado:', error);
        return of(null);
      })
    );
  }

  getAllResults(gameType: string): Observable<LotteryResult[]> {
    const apiName = this.apiNames[gameType];
    if (!apiName) return of([]);

    return this.http.get<LotteryResult[]>(`${this.baseUrl}/${apiName}`).pipe(
      catchError(error => {
        console.error('Erro ao buscar histórico:', error);
        return of([]);
      })
    );
  }

  getResultByContest(gameType: string, contestNumber: number): Observable<LotteryResult | null> {
    const apiName = this.apiNames[gameType];
    if (!apiName) return of(null);

    return this.http.get<LotteryResult>(`${this.baseUrl}/${apiName}/${contestNumber}`).pipe(
      catchError(error => {
        console.error('Erro ao buscar resultado:', error);
        return of(null);
      })
    );
  }

  checkHits(game: number[], result: number[]): number {
    const resultSet = new Set(result);
    return game.filter(num => resultSet.has(num)).length;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Bolao {
  id: string;
  lotteryType: string; // 'MEGA_SENA', 'QUINA', etc.
  contestNumber: number;
  contestDate: string;
  games: number[][]; // The generated games
  totalShares: number;
  availableShares: number;
  pricePerShare: number;
  totalCost: number;
  chanceLabel: string; // 'Alta', 'Muito Boa', etc.
  code: string; // e.g., 'LF-BXA-012'
}

@Injectable({
  providedIn: 'root'
})
export class BolaoService {
  // Mock initial data
  private initialBoloes: Bolao[] = [
    {
      id: '1',
      lotteryType: 'LOTOFACIL',
      contestNumber: 3575,
      contestDate: '2025-12-30',
      games: [],
      totalShares: 10,
      availableShares: 1,
      pricePerShare: 4669,
      totalCost: 46690,
      chanceLabel: 'Muito boa',
      code: 'LF-BXA-012'
    },
    {
      id: '2',
      lotteryType: 'LOTOMANIA',
      contestNumber: 2869,
      contestDate: '2025-12-31',
      games: [],
      totalShares: 5,
      availableShares: 1,
      pricePerShare: 4599,
      totalCost: 22995,
      chanceLabel: 'Alta',
      code: 'LM-ABO-003'
    }
  ];

  private boloesSubject = new BehaviorSubject<Bolao[]>(this.initialBoloes);
  boloes$ = this.boloesSubject.asObservable();

  constructor() {}

  getBoloes() {
    return this.boloes$;
  }

  addBolao(bolao: Bolao) {
    const current = this.boloesSubject.value;
    this.boloesSubject.next([...current, bolao]);
  }

  removeBolao(id: string) {
    const current = this.boloesSubject.value;
    this.boloesSubject.next(current.filter(b => b.id !== id));
  }
  
  getBolaoById(id: string) {
    return this.boloesSubject.value.find(b => b.id === id);
  }

  generateCode(type: string): string {
    // Simple code generator: LF-RND-123
    const prefix = type.substring(0, 2).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const mid = chars.charAt(Math.floor(Math.random() * chars.length)) + 
                chars.charAt(Math.floor(Math.random() * chars.length)) + 
                chars.charAt(Math.floor(Math.random() * chars.length));
    return `${prefix}-${mid}-${random}`;
  }
}

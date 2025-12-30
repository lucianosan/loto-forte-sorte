import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BolaoService, Bolao } from '../../services/bolao.service';

@Component({
  selector: 'app-bolao-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bolao-detail.html',
  styleUrl: './bolao-detail.scss',
})
export class BolaoDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private bolaoService = inject(BolaoService);
  
  bolao: Bolao | undefined;
  activeTab: 'details' | 'games' | 'strategies' = 'strategies';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bolao = this.bolaoService.getBolaoById(id);
    }
  }

  buyBolao() {
    if (this.bolao) {
      alert(`Você adicionou o bolão ${this.bolao.code} ao carrinho!`);
    }
  }

  get uniqueNumbers(): number[] {
    if (!this.bolao) return [];
    // Flatten all games and get unique numbers sorted
    const allNumbers = this.bolao.games.flat();
    return [...new Set(allNumbers)].sort((a, b) => a - b);
  }
}

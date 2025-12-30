import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BolaoService, Bolao } from '../../services/bolao.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private bolaoService = inject(BolaoService);
  boloes$ = this.bolaoService.getBoloes();

  buyBolao(bolao: Bolao) {
    alert(`Você adicionou o bolão ${bolao.code} ao carrinho!`);
  }
}

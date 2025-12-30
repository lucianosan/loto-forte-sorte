import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { MegaSena } from './pages/mega-sena/mega-sena';
import { Lotofacil } from './pages/lotofacil/lotofacil';
import { Quina } from './pages/quina/quina';
import { Lotomania } from './pages/lotomania/lotomania';
import { DuplaSena } from './pages/dupla-sena/dupla-sena';
import { DiaDeSorte } from './pages/dia-de-sorte/dia-de-sorte';
import { SuperSete } from './pages/super-sete/super-sete';
import { MaisMilionaria } from './pages/mais-milionaria/mais-milionaria';
import { AdminBolao } from './pages/admin/bolao/admin-bolao';
import { BolaoDetail } from './pages/bolao-detail/bolao-detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'admin', component: AdminBolao },
  { path: 'bolao/:id', component: BolaoDetail },
  { path: 'mega-sena', component: MegaSena },
  { path: 'lotofacil', component: Lotofacil },
  { path: 'quina', component: Quina },
  { path: 'lotomania', component: Lotomania },
  { path: 'dupla-sena', component: DuplaSena },
  { path: 'dia-de-sorte', component: DiaDeSorte },
  { path: 'super-sete', component: SuperSete },
  { path: 'mais-milionaria', component: MaisMilionaria },
  { path: '**', redirectTo: '' }
];

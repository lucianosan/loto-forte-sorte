import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { GameType } from './game';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  generatePdf(games: number[][], type: GameType, gameName: string) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    
    let x = margin;
    let y = margin + 10; // Espaço do cabeçalho
    
    // Configurações por tipo de jogo (tamanho do cartão, etc)
    const layout = this.getLayout(type);
    const cardWidth = layout.width;
    const cardHeight = layout.height;
    
    // Título do PDF
    doc.setFontSize(16);
    doc.text(`Jogos Gerados - ${gameName}`, margin, margin);
    doc.setFontSize(10);
    
    games.forEach((game, index) => {
      // Verifica se cabe na página atual
      if (y + cardHeight > pageHeight - margin) {
        doc.addPage();
        y = margin + 10;
        x = margin;
      }
      
      // Verifica se cabe na linha atual
      if (x + cardWidth > pageWidth - margin) {
        x = margin;
        y += cardHeight + 5; // Espaço vertical entre cartões
        
        // Verifica novamente altura após quebra de linha
        if (y + cardHeight > pageHeight - margin) {
          doc.addPage();
          y = margin + 10;
          x = margin;
        }
      }
      
      this.drawCard(doc, x, y, game, type, index + 1);
      
      x += cardWidth + 5; // Espaço horizontal entre cartões
    });
    
    doc.save(`jogos-${type.toLowerCase()}.pdf`);
  }

  private getLayout(type: GameType) {
    switch(type) {
      case 'MEGA_SENA': return { width: 80, height: 50 };
      case 'LOTOFACIL': return { width: 60, height: 50 };
      case 'QUINA': return { width: 90, height: 60 };
      case 'LOTOMANIA': return { width: 100, height: 100 };
      case 'DUPLA_SENA': return { width: 80, height: 50 };
      case 'DIA_DE_SORTE': return { width: 80, height: 60 };
      case 'SUPER_SETE': return { width: 80, height: 60 };
      case 'MAIS_MILIONARIA': return { width: 90, height: 70 };
      default: return { width: 60, height: 40 };
    }
  }

  private drawCard(doc: jsPDF, x: number, y: number, game: number[], type: GameType, index: number) {
    const layout = this.getLayout(type);
    
    // Borda do cartão
    doc.setDrawColor(200, 200, 200);
    doc.rect(x, y, layout.width, layout.height);
    
    // Título do Jogo
    doc.setFontSize(8);
    doc.text(`Jogo ${index}`, x + 2, y + 5);
    
    // Desenha as bolhas/números
    this.drawBubbles(doc, x, y + 8, game, type, layout.width);
  }

  private drawBubbles(doc: jsPDF, startX: number, startY: number, game: number[], type: GameType, width: number) {
    const bubbleSize = 3;
    const spacing = 1.5;
    let colCount = 10;
    
    if (type === 'LOTOFACIL') colCount = 5;
    if (type === 'QUINA') colCount = 10;
    if (type === 'LOTOMANIA') colCount = 10;
    if (type === 'DIA_DE_SORTE') colCount = 7; // Ajustar para layout de meses
    if (type === 'SUPER_SETE') colCount = 7; // Colunas verticais
    
    // Configurações específicas de grade
    if (type === 'SUPER_SETE') {
       this.drawSuperSete(doc, startX, startY, game);
       return;
    }

    if (type === 'MAIS_MILIONARIA') {
        this.drawMaisMilionaria(doc, startX, startY, game);
        return;
    }
    
    if (type === 'DIA_DE_SORTE') {
        this.drawDiaDeSorte(doc, startX, startY, game);
        return;
    }

    // Grid genérico (Mega, Quina, Lotofácil, Lotomania, Dupla)
    const totalNumbers = this.getMaxNumber(type);
    const startNumber = (type === 'LOTOMANIA') ? 0 : 1;
    
    // Centralizar grid no card
    const gridWidth = colCount * (bubbleSize * 2 + spacing);
    const offsetX = (width - gridWidth) / 2;
    
    let currentX = startX + offsetX;
    let currentY = startY + bubbleSize;

    for (let i = startNumber; i <= (type === 'LOTOMANIA' ? 99 : totalNumbers); i++) {
        const isSelected = game.includes(i);
        
        if (isSelected) {
            doc.setFillColor(0, 0, 0); // Preto preenchido
            doc.circle(currentX + bubbleSize, currentY, bubbleSize, 'F');
            doc.setTextColor(255, 255, 255);
        } else {
            doc.setDrawColor(0, 0, 0);
            doc.circle(currentX + bubbleSize, currentY, bubbleSize, 'S');
            doc.setTextColor(0, 0, 0);
        }
        
        doc.setFontSize(4);
        const text = i.toString().padStart(2, '0');
        const textWidth = doc.getTextWidth(text);
        doc.text(text, currentX + bubbleSize - (textWidth/2), currentY + 1.5);
        
        // Próxima posição
        currentX += (bubbleSize * 2 + spacing);
        
        // Quebra de linha
        let shouldBreak = false;
        if (type === 'LOTOMANIA') {
            if ((i + 1) % 10 === 0) shouldBreak = true;
        } else {
             if (i % colCount === 0) shouldBreak = true;
        }

        if (shouldBreak) {
            currentX = startX + offsetX;
            currentY += (bubbleSize * 2 + spacing);
        }
    }
  }

  private drawDiaDeSorte(doc: jsPDF, x: number, y: number, game: number[]) {
      // 1-31 Numbers
      const bubbleSize = 3;
      const spacing = 1;
      let currentX = x + 5;
      let currentY = y + 3;
      
      // Desenha números 1-31
      for (let i = 1; i <= 31; i++) {
          const isSelected = game.includes(i);
          this.drawSingleBubble(doc, currentX, currentY, i.toString(), isSelected, bubbleSize);
          
          currentX += (bubbleSize * 2 + spacing);
          if (i % 10 === 0) {
              currentX = x + 5;
              currentY += (bubbleSize * 2 + spacing);
          }
      }
      
      // Mês de Sorte (último número do array game > 31? Não, mês é separado na lógica, mas no array gerado ele vem junto?)
      // Vamos assumir que o mês está no array como número (ex: 1=Janeiro, 12=Dezembro). 
      // O jogo gerado tem 7 números + 1 mês.
      // Precisamos identificar o mês. Normalmente é o último ou separado. 
      // No meu GameService, o Dia de Sorte gera [...main, ...month].
      // Então se main tem 7, o índice 7 é o mês.
      
      // Desenha Mês
      currentY += 8;
      doc.setFontSize(6);
      doc.setTextColor(0, 0, 0);
      doc.text("Mês de Sorte:", x + 5, currentY);
      currentY += 4;
      currentX = x + 5;
      
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      // Encontrar qual número representa o mês. Geralmente números > 0.
      // Vou assumir que o mês é o último elemento se tiver 8 elementos.
      // Mas cuidado com a validação.
      
      // No layout, desenhamos os 12 meses
      for (let i = 1; i <= 12; i++) {
          const isSelected = game.includes(i) && game.indexOf(i) >= 7; // Lógica simplificada: se está no jogo e é provável que seja o mês
          // Melhor: checar se o número está presente E se já contamos 7 números normais. 
          // Como o Dia de Sorte tem 1-31, e mês é 1-12, pode haver colisão.
          // O ideal seria passar a estrutura separada, mas o método recebe number[].
          // Vou assumir que o último elemento é o mês se length > 7.
          
          let isMonth = false;
          if (game.length > 7) {
              const monthNum = game[game.length - 1];
              if (monthNum === i) isMonth = true;
          }

          this.drawSingleBubble(doc, currentX, currentY, months[i-1], isMonth, bubbleSize, true);
           currentX += (bubbleSize * 2 + spacing + 3); // Mais espaço para texto do mês
           if (i === 6) {
               currentX = x + 5;
               currentY += (bubbleSize * 2 + spacing);
           }
      }
  }
  
  private drawSuperSete(doc: jsPDF, x: number, y: number, game: number[]) {
      const bubbleSize = 2.5;
      const spacing = 1;
      const colSpacing = 4;
      let startX = x + 5;
      let startY = y + 5;
      
      // 7 Colunas, 0-9 em cada
      for (let col = 0; col < 7; col++) {
          let currentY = startY;
          doc.text(`C${col+1}`, startX + bubbleSize - 1, currentY - 2);
          
          for (let num = 0; num <= 9; num++) {
             // Verificar se este número nesta coluna foi escolhido.
             // O jogo Super Sete é um array de 7 números, onde o índice é a coluna e o valor é o número.
             const isSelected = game[col] === num;
             
             this.drawSingleBubble(doc, startX, currentY, num.toString(), isSelected, bubbleSize);
             currentY += (bubbleSize * 2 + spacing);
          }
          startX += (bubbleSize * 2 + colSpacing);
      }
  }

  private drawMaisMilionaria(doc: jsPDF, x: number, y: number, game: number[]) {
      // Números 1-50
      // Trevos 1-6
      const bubbleSize = 3;
      let currentX = x + 5;
      let currentY = y + 5;
      
      // Matriz 1 (Números)
      doc.setFontSize(6);
      doc.text("Números", currentX, currentY - 2);
      
      // Separar números e trevos. 
      // Jogo tem 6 números + 2 trevos = 8 itens.
      // Primeiros 6 são 1-50. Últimos 2 são 1-6.
      const mainNumbers = game.slice(0, 6);
      const trevos = game.slice(6);
      
      // Desenhar grade 1-50 (10 colunas x 5 linhas)
      for (let i = 1; i <= 50; i++) {
          const isSelected = mainNumbers.includes(i);
          this.drawSingleBubble(doc, currentX, currentY, i.toString(), isSelected, bubbleSize);
           currentX += (bubbleSize * 2 + 1);
           if (i % 10 === 0) {
               currentX = x + 5;
               currentY += (bubbleSize * 2 + 1);
           }
      }
      
      // Matriz 2 (Trevos)
      currentY += 5;
      doc.text("Trevos", x + 5, currentY - 2);
      currentX = x + 5;
      
      for (let i = 1; i <= 6; i++) {
          const isSelected = trevos.includes(i);
          this.drawSingleBubble(doc, currentX, currentY, "T"+i, isSelected, bubbleSize, true);
          currentX += (bubbleSize * 2 + 4);
      }
  }

  private drawSingleBubble(doc: jsPDF, x: number, y: number, text: string, isSelected: boolean, size: number, isTextWide = false) {
      if (isSelected) {
            doc.setFillColor(0, 0, 0);
            doc.circle(x + size, y, size, 'F');
            doc.setTextColor(255, 255, 255);
        } else {
            doc.setDrawColor(0, 0, 0);
            doc.circle(x + size, y, size, 'S');
            doc.setTextColor(0, 0, 0);
        }
        
        doc.setFontSize(isTextWide ? 4 : 5);
        const textWidth = doc.getTextWidth(text);
        doc.text(text, x + size - (textWidth/2), y + 1.5);
  }

  private getMaxNumber(type: GameType): number {
    switch(type) {
      case 'MEGA_SENA': return 60;
      case 'LOTOFACIL': return 25;
      case 'QUINA': return 80;
      case 'LOTOMANIA': return 99; // 0-99
      case 'DUPLA_SENA': return 50;
      default: return 60;
    }
  }
}

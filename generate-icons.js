/**
 * Script Node.js para gerar ícones PWA - Dev Freelancer
 * Execute: node generate-icons.js
 * 
 * Requer: npm install canvas
 */

const fs = require('fs');
const { createCanvas } = require('canvas');

// Cores do tema Dev Freelancer
const colors = {
  primary: '#2563EB',      // Azul principal
  secondary: '#1E40AF',    // Azul escuro
  accent: '#3B82F6',       // Azul claro
  dark: '#1E3A8A',         // Azul muito escuro
  white: '#FFFFFF',
  code: '#10B981'          // Verde para símbolo de código
};

function createDevFreelancerIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fundo com gradiente
  const gradient = ctx.createRadialGradient(
    size * 0.3, size * 0.3, 0,
    size * 0.5, size * 0.5, size * 0.8
  );
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(1, colors.dark);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Adiciona bordas arredondadas
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  const radius = size * 0.15;
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // Desenha símbolo de código/desenvolvimento
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Símbolo de código: < />
  ctx.strokeStyle = colors.white;
  ctx.fillStyle = colors.white;
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Desenha "<"
  const codeSize = size * 0.2;
  const codeY = centerY;
  ctx.beginPath();
  ctx.moveTo(centerX - codeSize * 0.3, codeY - codeSize * 0.4);
  ctx.lineTo(centerX - codeSize * 0.6, codeY);
  ctx.lineTo(centerX - codeSize * 0.3, codeY + codeSize * 0.4);
  ctx.stroke();
  
  // Desenha "/"
  ctx.beginPath();
  ctx.moveTo(centerX - codeSize * 0.1, codeY - codeSize * 0.5);
  ctx.lineTo(centerX + codeSize * 0.1, codeY + codeSize * 0.5);
  ctx.stroke();
  
  // Desenha ">"
  ctx.beginPath();
  ctx.moveTo(centerX + codeSize * 0.3, codeY - codeSize * 0.4);
  ctx.lineTo(centerX + codeSize * 0.6, codeY);
  ctx.lineTo(centerX + codeSize * 0.3, codeY + codeSize * 0.4);
  ctx.stroke();
  
  // Adiciona ponto decorativo (representando código)
  ctx.fillStyle = colors.code;
  ctx.beginPath();
  ctx.arc(centerX, centerY + size * 0.25, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

// Polyfill para roundRect (se não disponível)
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
  };
}

try {
  // Gera ícone 192x192
  const icon192 = createChefFinanceIcon(192);
  fs.writeFileSync('icon-192.png', icon192);
  console.log('✅ icon-192.png criado com sucesso!');

  // Gera ícone 512x512
  const icon512 = createChefFinanceIcon(512);
  fs.writeFileSync('icon-512.png', icon512);
  console.log('✅ icon-512.png criado com sucesso!');

  console.log('\n🎉 Ícones Dev Freelancer gerados com sucesso!');
  console.log('📱 Os ícones estão prontos para uso no PWA');
} catch (error) {
  console.error('❌ Erro ao gerar ícones:', error.message);
  console.log('\n💡 Alternativa: Use o arquivo criar-icones.html no navegador');
  console.log('   Ou instale o canvas: npm install canvas');
}

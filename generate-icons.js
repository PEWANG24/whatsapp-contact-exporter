const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient (simulate with solid color)
  ctx.fillStyle = '#667eea';
  ctx.fillRect(0, 0, size, size);

  // Add a circular background
  ctx.fillStyle = '#764ba2';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Draw WhatsApp-style phone icon
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.08;

  // Phone shape
  const centerX = size / 2;
  const centerY = size / 2;
  const phoneSize = size * 0.35;

  ctx.beginPath();
  ctx.arc(centerX - phoneSize * 0.3, centerY - phoneSize * 0.3, phoneSize * 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX + phoneSize * 0.3, centerY + phoneSize * 0.3, phoneSize * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Connection line
  ctx.beginPath();
  ctx.moveTo(centerX - phoneSize * 0.2, centerY - phoneSize * 0.2);
  ctx.quadraticCurveTo(centerX, centerY, centerX + phoneSize * 0.2, centerY + phoneSize * 0.2);
  ctx.stroke();

  // Add text for larger icons
  if (size >= 48) {
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.15}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('WA', centerX, size - size * 0.1);
  }

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Generated ${filename}`);
}

// Generate all three sizes
try {
  generateIcon(16, 'icons/icon16.png');
  generateIcon(48, 'icons/icon48.png');
  generateIcon(128, 'icons/icon128.png');
  console.log('All icons generated successfully!');
} catch (error) {
  console.error('Error generating icons:', error.message);
  console.log('\nNote: This script requires the "canvas" package.');
  console.log('If you see an error, we will use an alternative method.');
}

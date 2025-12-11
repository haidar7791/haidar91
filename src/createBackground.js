// createBackground.js
const fs = require('fs');
const { createCanvas } = require('canvas');

// إنشاء canvas
const width = 512;
const height = 512;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// خلفية متدرجة
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#1a472a');
gradient.addColorStop(0.5, '#2a5c3d');
gradient.addColorStop(1, '#2d7d4a');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// إضافة بعض النجوم
ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
for (let i = 0; i < 50; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const size = Math.random() * 3 + 1;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

// إضافة تأثير فضاء
ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
for (let i = 0; i < 20; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const radius = Math.random() * 50 + 20;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// حفظ الصورة
const buffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });
fs.writeFileSync('assets/images/background.jpg', buffer);

console.log('✅ تم إنشاء background.jpg في assets/images/');

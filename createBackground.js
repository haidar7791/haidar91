// createBackground.js
const fs = require('fs');
const { createCanvas } = require('canvas');

// إنشاء canvas
const width = 1024;  // زيادة الحجم ليكون أفضل
const height = 1024;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// خلفية متدرجة
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#1a472a');
gradient.addColorStop(0.5, '#2a5c3d');
gradient.addColorStop(1, '#2d7d4a');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// إضافة بعض النجوم (مثل النجوم في الفضاء)
ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
for (let i = 0; i < 100; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const size = Math.random() * 2 + 0.5;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

// إضافة دوائر فاتحة لتأثير العمق
ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
for (let i = 0; i < 15; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const radius = Math.random() * 80 + 30;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// إضافة توهج مركزي
const centerGradient = ctx.createRadialGradient(
  width/2, height/2, 0,
  width/2, height/2, 300
);
centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

ctx.fillStyle = centerGradient;
ctx.fillRect(0, 0, width, height);

// إضافة خطوط شبكة خفيفة
ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
ctx.lineWidth = 1;

// خطوط رأسية
for (let x = 0; x <= width; x += 50) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
}

// خطوط أفقية
for (let y = 0; y <= height; y += 50) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
}

// إضافة تأثير فضاء (دوائر داكنة)
ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
for (let i = 0; i < 25; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const radius = Math.random() * 60 + 20;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// حفظ الصورة
const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
fs.writeFileSync('assets/images/background.jpg', buffer);

console.log('✅ تم إنشاء background.jpg بحجم ' + width + 'x' + height + ' في assets/images/');

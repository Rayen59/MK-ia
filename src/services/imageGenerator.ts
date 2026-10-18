import { GeneratedImage } from '../types';

export const IMAGE_STYLE_PRESETS = [
  { id: 'cinematic', label: 'Cinématique 8K', icon: '🎬', description: 'Éclairage volumétrique et profondeur Leica' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: '⚡', description: 'Villes nocturnes, reflets néon et pluies de lumière' },
  { id: '3d-render', label: 'Rendu 3D Studio', icon: '💎', description: 'Surfaces texturées, éclairage doux et géométrie pure' },
  { id: 'anime', label: 'Anime Studio', icon: '✨', description: 'Lignes claires, couleurs vibrantes Makoto Shinkai' },
  { id: 'cosmic', label: 'Cosmique & Spatial', icon: '🌌', description: 'Nébuleuses stellaires, planètes et aurores astrales' },
  { id: 'minimalist', label: 'Minimaliste Architectural', icon: '🏛️', description: 'Compositions épurées, béton, ombres et verre' },
];

// Generates procedural high-resolution Canvas artwork from prompt
export async function generateArtImage(
  prompt: string,
  style: string = 'cinematic',
  aspectRatio: '1:1' | '16:9' | '9:16' = '1:1'
): Promise<GeneratedImage> {
  // Simulate AI creation delay
  await new Promise(r => setTimeout(r, 800));

  let width = 1024;
  let height = 1024;

  if (aspectRatio === '16:9') {
    width = 1280;
    height = 720;
  } else if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Generate deterministic seed based on prompt
  let seed = 0;
  for (let i = 0; i < prompt.length; i++) {
    seed = (seed * 31 + prompt.charCodeAt(i)) % 100000;
  }

  // Draw background based on style
  const grad = ctx.createLinearGradient(0, 0, width, height);

  if (style === 'cyberpunk') {
    grad.addColorStop(0, '#090a1a');
    grad.addColorStop(0.5, '#1e0826');
    grad.addColorStop(1, '#051329');
  } else if (style === 'cosmic') {
    grad.addColorStop(0, '#03001e');
    grad.addColorStop(0.4, '#7303c0');
    grad.addColorStop(0.7, '#ec38bc');
    grad.addColorStop(1, '#fdeff9');
  } else if (style === 'anime') {
    grad.addColorStop(0, '#1a365d');
    grad.addColorStop(0.5, '#7b2cbf');
    grad.addColorStop(1, '#ff9e00');
  } else if (style === 'minimalist') {
    grad.addColorStop(0, '#18181b');
    grad.addColorStop(0.5, '#27272a');
    grad.addColorStop(1, '#09090b');
  } else {
    // Cinematic default
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#020617');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Draw generative planetary / geometric forms
  ctx.save();
  const centerX = width * 0.5;
  const centerY = height * 0.45;
  const radius = Math.min(width, height) * 0.28;

  // Outer ambient glow
  const glowGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.8);
  if (style === 'cyberpunk') {
    glowGrad.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    glowGrad.addColorStop(0.6, 'rgba(255, 0, 128, 0.2)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else if (style === 'cosmic') {
    glowGrad.addColorStop(0, 'rgba(236, 56, 188, 0.45)');
    glowGrad.addColorStop(0.7, 'rgba(115, 3, 192, 0.15)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    glowGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.15)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // Central Sphere / Motif
  const sphereGrad = ctx.createRadialGradient(
    centerX - radius * 0.3,
    centerY - radius * 0.3,
    radius * 0.05,
    centerX,
    centerY,
    radius
  );

  if (style === 'cyberpunk') {
    sphereGrad.addColorStop(0, '#00f5ff');
    sphereGrad.addColorStop(0.5, '#7928ca');
    sphereGrad.addColorStop(1, '#0c0014');
  } else if (style === 'minimalist') {
    sphereGrad.addColorStop(0, '#f4f4f5');
    sphereGrad.addColorStop(0.7, '#71717a');
    sphereGrad.addColorStop(1, '#18181b');
  } else {
    sphereGrad.addColorStop(0, '#38bdf8');
    sphereGrad.addColorStop(0.4, '#6366f1');
    sphereGrad.addColorStop(1, '#090d16');
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = sphereGrad;
  ctx.shadowColor = style === 'cyberpunk' ? '#00f0ff' : '#6366f1';
  ctx.shadowBlur = 40;
  ctx.fill();
  ctx.restore();

  // Draw geometric orbital rings / light ribbons
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(0.35);

  ctx.lineWidth = 3;
  ctx.strokeStyle = style === 'cyberpunk' ? 'rgba(0, 245, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.6, radius * 0.45, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.9, radius * 0.55, 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Draw particle constellations
  ctx.save();
  for (let i = 0; i < 90; i++) {
    const px = (Math.sin(seed + i * 997) * 0.5 + 0.5) * width;
    const py = (Math.cos(seed + i * 433) * 0.5 + 0.5) * height;
    const psize = ((i % 5) + 1) * 0.8;
    const alpha = (i % 7) / 7 * 0.7 + 0.3;

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, psize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Bottom artistic horizon landscape
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width; x += 30) {
    const hillHeight = Math.sin((x + seed) * 0.005) * 60 + Math.cos((x + seed) * 0.015) * 30 + 120;
    ctx.lineTo(x, height - hillHeight);
  }
  ctx.lineTo(width, height);
  ctx.closePath();

  const horizonGrad = ctx.createLinearGradient(0, height - 200, 0, height);
  horizonGrad.addColorStop(0, 'rgba(5, 7, 15, 0.8)');
  horizonGrad.addColorStop(1, '#020307');
  ctx.fillStyle = horizonGrad;
  ctx.fill();
  ctx.restore();

  // Watermark in bottom right corner: "MK IMAGINE"
  ctx.save();
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.textAlign = 'right';
  ctx.fillText('MK IMAGINE • 0-KEY NEURAL', width - 24, height - 24);

  // Subtle prompt caption bottom left
  ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.textAlign = 'left';
  const displayPrompt = prompt.length > 55 ? prompt.slice(0, 52) + '...' : prompt;
  ctx.fillText(`“${displayPrompt}”`, 24, height - 24);
  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png');

  return {
    id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    prompt,
    style,
    aspectRatio,
    url: dataUrl,
    createdAt: Date.now()
  };
}

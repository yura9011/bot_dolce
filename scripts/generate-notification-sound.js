const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const duration = 0.25;
const frequency = 800;
const amplitude = 16000;
const numSamples = Math.floor(sampleRate * duration);

// Generar sine wave
const samples = Buffer.alloc(numSamples * 2);
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const envelope = Math.max(0, 1 - t / duration); // fade out
  const value = Math.sin(2 * Math.PI * frequency * t) * amplitude * envelope;
  samples.writeInt16LE(Math.round(value), i * 2);
}

// WAV header
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + samples.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16); // chunk size
header.writeUInt16LE(1, 20);  // PCM
header.writeUInt16LE(1, 22);  // mono
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * 2, 28); // byte rate
header.writeUInt16LE(2, 32);  // block align
header.writeUInt16LE(16, 34); // bits per sample
header.write('data', 36);
header.writeUInt32LE(samples.length, 40);

const outputPath = path.join(__dirname, '..', 'dashboard-humano-v2', 'public', 'assets', 'sounds', 'notification.wav');
fs.writeFileSync(outputPath, Buffer.concat([header, samples]));
console.log('✅ notification.wav generated:', outputPath);
console.log(`   Duration: ${duration}s, Frequency: ${frequency}Hz, Size: ${(header.length + samples.length) / 1024}KB`);

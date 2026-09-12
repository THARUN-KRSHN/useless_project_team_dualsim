/**
 * Synthesizes a crisp, physically-satisfying leaf snap / pop sound
 * using the Web Audio API without needing external asset files.
 */
export function playLeafPopSound(volume: number = 0.8) {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // 1. High-frequency snap / click transient
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1400, ctx.currentTime);
    snapOsc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    snapGain.gain.setValueAtTime(volume * 0.9, ctx.currentTime);
    snapGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);

    snapOsc.start();
    snapOsc.stop(ctx.currentTime + 0.08);

    // 2. Air burst noise transient
    const bufferSize = ctx.sampleRate * 0.09;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.6, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start();
    whiteNoise.stop(ctx.currentTime + 0.09);

    setTimeout(() => {
      if (ctx.state !== 'closed') {
        ctx.close();
      }
    }, 200);
  } catch (err) {
    console.error('Audio pop playback error:', err);
  }
}

export function encodeWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const samples = audioBuffer.length;
  const blockAlign = numChannels * bitDepth / 8;
  const byteRate = sampleRate * blockAlign;
  const dataLength = samples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  const channelData = Array.from({ length: numChannels }, (_, ch) => audioBuffer.getChannelData(ch));

  for (let i = 0; i < samples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export async function convertBlobToWav(blob: Blob): Promise<File> {
  if (blob.type.includes('wav')) {
    return new File([blob], `recording.wav`, { type: 'audio/wav' });
  }

  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    return new File([blob], `recording.webm`, { type: blob.type || 'audio/webm' });
  }

  const audioContext = new AudioCtx();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const wavBlob = encodeWav(audioBuffer);
    return new File([wavBlob], `recording.wav`, { type: 'audio/wav' });
  } finally {
    await audioContext.close();
  }
}

/**
 * Creates a valid synthetic leaf pop WAV file for quick testing / fallback
 */
export function createSyntheticPopWav(loudness: 'loud' | 'medium' | 'soft' = 'loud'): File {
  const sampleRate = 44100;
  const duration = 1.2;
  const numSamples = Math.floor(sampleRate * duration);
  const pcmData = new Float32Array(numSamples);

  // Background ambient air
  for (let i = 0; i < numSamples; i++) {
    pcmData[i] = (Math.random() * 2 - 1) * 0.002;
  }

  // Pop burst in the middle (~0.4s in)
  const burstStart = Math.floor(sampleRate * 0.4);
  const burstLen = Math.floor(sampleRate * (loudness === 'loud' ? 0.09 : loudness === 'medium' ? 0.07 : 0.05));
  const amp = loudness === 'loud' ? 0.95 : loudness === 'medium' ? 0.65 : 0.4;

  for (let i = 0; i < burstLen; i++) {
    const t = i / burstLen;
    const env = Math.exp(-t * 9);
    const snap = Math.sin(2 * Math.PI * 1400 * (i / sampleRate)) * env;
    const noise = (Math.random() * 2 - 1) * env * 0.5;
    pcmData[burstStart + i] += (snap * 0.7 + noise * 0.3) * amp;
  }

  // Encode WAV
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return new File([blob], `leaf_pop_synthetic_${loudness}.wav`, { type: 'audio/wav' });
}

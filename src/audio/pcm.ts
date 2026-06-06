import type { AudioBuffer } from 'react-native-audio-api';

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: Uint8Array) {
  let result = '';
  let index = 0;

  while (index < bytes.length) {
    const first = bytes[index++];
    const second = index < bytes.length ? bytes[index++] : Number.NaN;
    const third = index < bytes.length ? bytes[index++] : Number.NaN;

    const triplet =
      (first << 16) |
      ((Number.isNaN(second) ? 0 : second) << 8) |
      (Number.isNaN(third) ? 0 : third);

    result += base64Chars[(triplet >> 18) & 63];
    result += base64Chars[(triplet >> 12) & 63];
    result += Number.isNaN(second) ? '=' : base64Chars[(triplet >> 6) & 63];
    result += Number.isNaN(third) ? '=' : base64Chars[triplet & 63];
  }

  return result;
}

function base64ToBytes(base64: string) {
  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  const bytes: number[] = [];

  for (let index = 0; index < clean.length; index += 4) {
    const encoded =
      (base64Chars.indexOf(clean[index]) << 18) |
      (base64Chars.indexOf(clean[index + 1]) << 12) |
      ((clean[index + 2] === '=' ? 0 : base64Chars.indexOf(clean[index + 2])) << 6) |
      (clean[index + 3] === '=' ? 0 : base64Chars.indexOf(clean[index + 3]));

    bytes.push((encoded >> 16) & 255);

    if (clean[index + 2] !== '=') {
      bytes.push((encoded >> 8) & 255);
    }

    if (clean[index + 3] !== '=') {
      bytes.push(encoded & 255);
    }
  }

  return new Uint8Array(bytes);
}

export function calculateAudioLevel(samples: Float32Array) {
  if (samples.length === 0) {
    return 0;
  }

  let sum = 0;

  for (const sample of samples) {
    sum += sample * sample;
  }

  const rms = Math.sqrt(sum / samples.length);
  return Math.round(Math.min(100, rms * 140));
}

export function floatToPcm16Bytes(samples: Float32Array) {
  const bytes = new Uint8Array(samples.length * 2);

  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    const pcm = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    const int16 = Math.round(pcm);
    bytes[index * 2] = int16 & 255;
    bytes[index * 2 + 1] = (int16 >> 8) & 255;
  });

  return bytes;
}

export function pcm16BytesToFloat(bytes: Uint8Array) {
  const samples = new Float32Array(Math.floor(bytes.length / 2));

  for (let index = 0; index < samples.length; index += 1) {
    const low = bytes[index * 2];
    const high = bytes[index * 2 + 1];
    const int16 = (high << 8) | low;
    const signed = int16 >= 0x8000 ? int16 - 0x10000 : int16;
    samples[index] = signed < 0 ? signed / 0x8000 : signed / 0x7fff;
  }

  return samples;
}

export function pcm16BytesToBase64(bytes: Uint8Array) {
  return bytesToBase64(bytes);
}

export function pcm16Base64ToFloat(base64: string) {
  return pcm16BytesToFloat(base64ToBytes(base64));
}

export function normalizeSamples(samples: Float32Array, targetPeak = 0.72) {
  let peak = 0;

  for (const sample of samples) {
    peak = Math.max(peak, Math.abs(sample));
  }

  if (peak <= 0.0001) {
    return samples;
  }

  const gain = Math.min(24, targetPeak / peak);
  const normalized = new Float32Array(samples.length);

  for (let index = 0; index < samples.length; index += 1) {
    normalized[index] = Math.max(-1, Math.min(1, samples[index] * gain));
  }

  return normalized;
}

export function resampleLinear(samples: Float32Array, sourceSampleRate: number, targetSampleRate: number) {
  if (sourceSampleRate === targetSampleRate || samples.length === 0) {
    return samples;
  }

  const ratio = targetSampleRate / sourceSampleRate;
  const targetLength = Math.max(1, Math.round(samples.length * ratio));
  const resampled = new Float32Array(targetLength);

  for (let targetIndex = 0; targetIndex < targetLength; targetIndex += 1) {
    const sourceIndex = targetIndex / ratio;
    const leftIndex = Math.floor(sourceIndex);
    const rightIndex = Math.min(leftIndex + 1, samples.length - 1);
    const fraction = sourceIndex - leftIndex;
    resampled[targetIndex] = samples[leftIndex] * (1 - fraction) + samples[rightIndex] * fraction;
  }

  return resampled;
}

export function audioBufferToMonoSamples(buffer: AudioBuffer) {
  if (buffer.numberOfChannels <= 1) {
    return buffer.getChannelData(0);
  }

  const mixed = new Float32Array(buffer.length);

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const channelData = buffer.getChannelData(channel);
    for (let index = 0; index < buffer.length; index += 1) {
      mixed[index] += channelData[index] / buffer.numberOfChannels;
    }
  }

  return mixed;
}

export function audioBufferToPcm16Frame(buffer: AudioBuffer, timestampSec: number) {
  const samples = audioBufferToMonoSamples(buffer);
  const bytes = floatToPcm16Bytes(samples);

  return {
    audioBase64: pcm16BytesToBase64(bytes),
    channels: 1 as const,
    durationMs: Math.round((samples.length / buffer.sampleRate) * 1000),
    level: calculateAudioLevel(samples),
    numFrames: samples.length,
    sampleRate: buffer.sampleRate,
    timestampSec,
  };
}

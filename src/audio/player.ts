import {
  AudioManager,
  AudioBufferSourceNode,
  AudioBufferQueueSourceNode,
  AudioContext,
} from 'react-native-audio-api';

import { pcm16Base64ToFloat } from '@/audio/pcm';

export type PlayerSpikeStats = {
  enqueuedBuffers: number;
  lastBufferDurationMs?: number;
  sampleRate?: number;
};

export class AudioApiRealtimePlayer {
  private activeSources: AudioBufferSourceNode[] = [];
  private context: AudioContext | null = null;
  private queue: AudioBufferQueueSourceNode | null = null;
  private started = false;
  private stats: PlayerSpikeStats = {
    enqueuedBuffers: 0,
  };

  getStats() {
    return this.stats;
  }

  async enqueuePcm16(audioBase64: string, sampleRate: number) {
    AudioManager.setAudioSessionOptions({
      iosCategory: 'playback',
      iosMode: 'default',
      iosOptions: ['defaultToSpeaker', 'mixWithOthers'],
    });

    const sessionActive = await AudioManager.setAudioSessionActivity(true);

    if (!sessionActive) {
      throw new Error('Failed to activate audio session for playback.');
    }

    this.ensureQueue(sampleRate);
    await this.context?.resume();

    if (!this.context || !this.queue) {
      throw new Error('Audio player queue is not ready.');
    }

    const samples = pcm16Base64ToFloat(audioBase64);
    const buffer = this.context.createBuffer(1, samples.length, sampleRate);
    buffer.copyToChannel(samples, 0);
    this.queue.enqueueBuffer(buffer);

    if (!this.started) {
      this.queue.connect(this.context.destination);
      this.queue.start(0, 0);
      this.started = true;
    }

    this.stats = {
      enqueuedBuffers: this.stats.enqueuedBuffers + 1,
      lastBufferDurationMs: Math.round((samples.length / sampleRate) * 1000),
      sampleRate,
    };
  }

  async playOneShotPcm16(audioBase64: string, sampleRate: number) {
    AudioManager.setAudioSessionOptions({
      iosCategory: 'playback',
      iosMode: 'default',
      iosOptions: ['defaultToSpeaker', 'mixWithOthers'],
    });

    const sessionActive = await AudioManager.setAudioSessionActivity(true);

    if (!sessionActive) {
      throw new Error('Failed to activate audio session for playback.');
    }

    this.ensureContext(sampleRate);
    await this.context?.resume();

    if (!this.context) {
      throw new Error('Audio context is not ready.');
    }

    const samples = pcm16Base64ToFloat(audioBase64);
    const buffer = this.context.createBuffer(1, samples.length, sampleRate);
    buffer.copyToChannel(samples, 0);

    const source = this.context.createBufferSource({ pitchCorrection: false });
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.onEnded = () => {
      this.activeSources = this.activeSources.filter((activeSource) => activeSource !== source);
    };
    this.activeSources.push(source);
    source.start(0, 0);

    this.stats = {
      enqueuedBuffers: this.stats.enqueuedBuffers,
      lastBufferDurationMs: Math.round((samples.length / sampleRate) * 1000),
      sampleRate,
    };
  }

  clearQueue() {
    this.queue?.clearBuffers();
  }

  stop() {
    this.queue?.clearBuffers();
    this.queue?.stop();
    this.queue = null;
    this.activeSources = [];
    this.started = false;
  }

  async close() {
    this.stop();
    await this.context?.close();
    await AudioManager.setAudioSessionActivity(false);
    this.context = null;
    this.stats = {
      enqueuedBuffers: 0,
    };
  }

  private ensureQueue(sampleRate: number) {
    this.ensureContext(sampleRate);
    const context = this.context;

    if (!context) {
      throw new Error('Audio context is not ready.');
    }

    if (!this.queue) {
      this.queue = context.createBufferQueueSource({ pitchCorrection: false });
    }
  }

  private ensureContext(sampleRate: number) {
    if (!this.context) {
      this.context = new AudioContext({ sampleRate });
    }
  }
}

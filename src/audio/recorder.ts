import { AudioManager, AudioRecorder } from 'react-native-audio-api';

import { audioBufferToPcm16Frame } from '@/audio/pcm';

export type RealtimeAudioInputFrame = {
  audioBase64: string;
  channels: 1;
  durationMs: number;
  level: number;
  numFrames: number;
  sampleRate: number;
  timestampSec: number;
};

export type AudioFrameHandler = (frame: RealtimeAudioInputFrame) => void;

export type RecorderSpikeStats = {
  actualChunkMs?: number;
  actualSampleRate?: number;
  framesReceived: number;
  lastLevel: number;
  requestedBufferLength: number;
  requestedChannelCount: number;
  requestedSampleRate: number;
};

const targetSampleRate = 16000;
const targetChunkMs = 40;
const targetChannelCount = 1;
const targetBufferLength = Math.round((targetSampleRate * targetChunkMs) / 1000);

function assertRecorderResult(result: { status: 'success' } | { status: 'error'; message: string }) {
  if (result.status === 'error') {
    throw new Error(result.message);
  }
}

export class AudioApiRealtimeRecorder {
  private readonly recorder = new AudioRecorder();
  private stats: RecorderSpikeStats = {
    framesReceived: 0,
    lastLevel: 0,
    requestedBufferLength: targetBufferLength,
    requestedChannelCount: targetChannelCount,
    requestedSampleRate: targetSampleRate,
  };

  getStats() {
    return this.stats;
  }

  async start(onFrame: AudioFrameHandler) {
    const permissionStatus = await AudioManager.requestRecordingPermissions();

    if (permissionStatus !== 'Granted') {
      throw new Error(`Microphone permission is ${permissionStatus}.`);
    }

    AudioManager.setAudioSessionOptions({
      iosCategory: 'playAndRecord',
      iosMode: 'measurement',
      iosOptions: ['defaultToSpeaker', 'allowBluetoothHFP'],
    });

    const sessionActive = await AudioManager.setAudioSessionActivity(true);

    if (!sessionActive) {
      throw new Error('Failed to activate audio session.');
    }

    const callbackResult = this.recorder.onAudioReady(
      {
        bufferLength: targetBufferLength,
        channelCount: targetChannelCount,
        sampleRate: targetSampleRate,
      },
      (event) => {
        const frame = audioBufferToPcm16Frame(event.buffer, event.when);
        this.stats = {
          ...this.stats,
          actualChunkMs: frame.durationMs,
          actualSampleRate: frame.sampleRate,
          framesReceived: this.stats.framesReceived + 1,
          lastLevel: frame.level,
        };
        onFrame(frame);
      },
    );

    assertRecorderResult(callbackResult);

    const startResult = this.recorder.start();
    assertRecorderResult(startResult);
  }

  async stop() {
    this.recorder.clearOnAudioReady();

    if (!this.recorder.isRecording()) {
      await AudioManager.setAudioSessionActivity(false);
      return;
    }

    const stopResult = this.recorder.stop();
    assertRecorderResult(stopResult);
    await AudioManager.setAudioSessionActivity(false);
  }
}

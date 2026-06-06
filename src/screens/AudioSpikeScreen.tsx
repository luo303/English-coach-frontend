import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AudioManager } from 'react-native-audio-api';

import { AudioApiRealtimePlayer, PlayerSpikeStats } from '@/audio/player';
import {
  floatToPcm16Bytes,
  normalizeSamples,
  pcm16Base64ToFloat,
  pcm16BytesToBase64,
  resampleLinear,
} from '@/audio/pcm';
import {
  AudioApiRealtimeRecorder,
  RealtimeAudioInputFrame,
  RecorderSpikeStats,
} from '@/audio/recorder';
import { AppPalette } from '@/constants/appPalette';

function createToneBase64(sampleRate: number, durationMs: number) {
  const sampleCount = Math.round((sampleRate * durationMs) / 1000);
  const samples = new Float32Array(sampleCount);

  for (let index = 0; index < sampleCount; index += 1) {
    samples[index] = Math.sin((2 * Math.PI * 880 * index) / sampleRate) * 0.72;
  }

  return pcm16BytesToBase64(floatToPcm16Bytes(samples));
}

function getPlaybackSampleRate() {
  const preferredSampleRate = AudioManager.getDevicePreferredSampleRate();
  return preferredSampleRate > 0 ? preferredSampleRate : 48000;
}

export function AudioSpikeScreen() {
  const playerRef = useRef(new AudioApiRealtimePlayer());
  const recordedFramesRef = useRef<RealtimeAudioInputFrame[]>([]);
  const recorderRef = useRef(new AudioApiRealtimeRecorder());
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lastFrame, setLastFrame] = useState<RealtimeAudioInputFrame | null>(null);
  const [playerStatus, setPlayerStatus] = useState('idle');
  const [recorderStatus, setRecorderStatus] = useState('idle');
  const [playerStats, setPlayerStats] = useState<PlayerSpikeStats>(playerRef.current.getStats());
  const [recorderStats, setRecorderStats] = useState<RecorderSpikeStats>(recorderRef.current.getStats());

  useEffect(() => {
    const player = playerRef.current;
    const recorder = recorderRef.current;

    return () => {
      void recorder.stop();
      void player.close();
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    setRecorderStatus('requesting permission');

    try {
      await recorderRef.current.start((frame) => {
        recordedFramesRef.current = [...recordedFramesRef.current, frame].slice(-80);
        setLastFrame(frame);
        setRecorderStats(recorderRef.current.getStats());
        setRecorderStatus('receiving frames');
      });
      setIsRecording(true);
      setRecorderStatus('waiting for first frame');
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Failed to start recorder.');
      setIsRecording(false);
      setRecorderStatus('error');
    }
  };

  const stopRecording = async () => {
    setError(null);
    setRecorderStatus('stopping');

    try {
      await recorderRef.current.stop();
      setRecorderStats(recorderRef.current.getStats());
      setIsRecording(false);
      setRecorderStatus('stopped');
    } catch (stopError) {
      setError(stopError instanceof Error ? stopError.message : 'Failed to stop recorder.');
      setRecorderStatus('error');
    }
  };

  const playTone = async () => {
    setError(null);
    setPlayerStatus('activating session');

    try {
      const sampleRate = getPlaybackSampleRate();
      await playerRef.current.enqueuePcm16(createToneBase64(sampleRate, 1000), sampleRate);
      setPlayerStats(playerRef.current.getStats());
      setPlayerStatus('tone enqueued');
    } catch (playError) {
      setError(playError instanceof Error ? playError.message : 'Failed to enqueue tone.');
      setPlayerStatus('error');
    }
  };

  const playSourceTone = async () => {
    setError(null);
    setPlayerStatus('activating source');

    try {
      const sampleRate = getPlaybackSampleRate();
      await playerRef.current.playOneShotPcm16(createToneBase64(sampleRate, 1000), sampleRate);
      setPlayerStats(playerRef.current.getStats());
      setPlayerStatus('source started');
    } catch (playError) {
      setError(playError instanceof Error ? playError.message : 'Failed to start source tone.');
      setPlayerStatus('error');
    }
  };

  const playRecentRecording = async () => {
    setError(null);
    setPlayerStatus('preparing recording');

    try {
      const frames = recordedFramesRef.current;
      const sourceSampleRate = frames[0]?.sampleRate;

      if (!sourceSampleRate || frames.length === 0) {
        throw new Error('No recorded frames available. Record for one or two seconds first.');
      }

      const compatibleFrames = frames.filter((frame) => frame.sampleRate === sourceSampleRate);
      const samples = compatibleFrames.map((frame) => pcm16Base64ToFloat(frame.audioBase64));
      const totalLength = samples.reduce((total, chunk) => total + chunk.length, 0);
      const mergedSamples = new Float32Array(totalLength);
      let offset = 0;

      samples.forEach((chunk) => {
        mergedSamples.set(chunk, offset);
        offset += chunk.length;
      });

      const playbackSampleRate = getPlaybackSampleRate();
      const normalizedSamples = normalizeSamples(mergedSamples);
      const playbackSamples = resampleLinear(normalizedSamples, sourceSampleRate, playbackSampleRate);
      const audioBase64 = pcm16BytesToBase64(floatToPcm16Bytes(playbackSamples));
      await playerRef.current.playOneShotPcm16(audioBase64, playbackSampleRate);
      setPlayerStats(playerRef.current.getStats());
      setPlayerStatus(`recording played ${sourceSampleRate}->${playbackSampleRate}`);
    } catch (playError) {
      setError(playError instanceof Error ? playError.message : 'Failed to play recorded frames.');
      setPlayerStatus('error');
    }
  };

  const clearPlayer = () => {
    playerRef.current.clearQueue();
    setPlayerStats(playerRef.current.getStats());
    setPlayerStatus('queue cleared');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Realtime audio spike</Text>
        <Text style={styles.title}>音频链路</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Recorder</Text>
        <View style={styles.buttonRow}>
          <Pressable disabled={isRecording} onPress={startRecording} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>开始录音</Text>
          </Pressable>
          <Pressable disabled={!isRecording} onPress={stopRecording} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>停止</Text>
          </Pressable>
        </View>

        <View style={styles.statGrid}>
          <Stat label="请求采样率" value={`${recorderStats.requestedSampleRate}`} />
          <Stat label="实际采样率" value={`${recorderStats.actualSampleRate ?? '-'}`} />
          <Stat label="请求样本" value={`${recorderStats.requestedBufferLength}`} />
          <Stat label="实际 chunk" value={`${recorderStats.actualChunkMs ?? '-'}ms`} />
          <Stat label="帧数" value={`${recorderStats.framesReceived}`} />
          <Stat label="音量" value={`${lastFrame?.level ?? recorderStats.lastLevel}`} />
          <Stat label="状态" value={recorderStatus} />
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Player</Text>
        <View style={styles.buttonRow}>
          <Pressable onPress={playTone} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>队列播放</Text>
          </Pressable>
          <Pressable onPress={playSourceTone} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Source 测试</Text>
          </Pressable>
        </View>
        <View style={styles.buttonRow}>
          <Pressable onPress={playRecentRecording} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>播放录音</Text>
          </Pressable>
          <Pressable onPress={clearPlayer} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>清队列</Text>
          </Pressable>
        </View>
        <View style={styles.buttonRow}>
          <Pressable onPress={() => void playerRef.current.close()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>关闭音频</Text>
          </Pressable>
        </View>

        <View style={styles.statGrid}>
          <Stat label="入队片段" value={`${playerStats.enqueuedBuffers}`} />
          <Stat label="采样率" value={`${playerStats.sampleRate ?? '-'}`} />
          <Stat label="片段时长" value={`${playerStats.lastBufferDurationMs ?? '-'}ms`} />
          <Stat label="输出格式" value="PCM16" />
          <Stat label="状态" value={playerStatus} />
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Spike verdict</Text>
        <Text style={styles.noteText}>需要 Development Build 真机验证；Expo Go 或 Web 可能无法加载原生模块。</Text>
        <Text style={styles.noteText}>当前项目存在 worklets peer 风险：audio-api 要求 &gt;= 0.6.0，Expo/Reanimated 当前为 0.5.1。</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 92,
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    color: AppPalette.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: AppPalette.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  panel: {
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  panelTitle: {
    color: AppPalette.ink,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: AppPalette.blue,
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: AppPalette.blueSoft,
    borderColor: '#BFD2FF',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    color: AppPalette.blue,
    fontSize: 15,
    fontWeight: '900',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    backgroundColor: AppPalette.page,
    borderColor: AppPalette.line,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    width: '47%',
  },
  statLabel: {
    color: AppPalette.muted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 5,
  },
  statValue: {
    color: AppPalette.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  noteText: {
    color: AppPalette.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  errorBox: {
    backgroundColor: '#FFF1F1',
    borderColor: '#FFD1D1',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  errorText: {
    color: AppPalette.red,
    fontSize: 14,
    fontWeight: '800',
  },
});

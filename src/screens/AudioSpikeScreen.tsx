import { Button, Card, Typography as Text } from 'heroui-native';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
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
import { MetricCard, ScreenHeader } from '@/components/ui/AppLayout';
import { AppPalette } from '@/constants/appPalette';
import { useErrorToast } from '@/hooks/useErrorToast';

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
  useErrorToast({ message: error, title: '音频链路异常' });

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
    <ScrollView
      className="bg-background"
      contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20, paddingTop: 20 }}
      contentContainerClassName="px-5 pt-5 pb-28"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: AppPalette.background, flex: 1 }}
    >
      <ScreenHeader eyebrow="调试" title="音频链路" subtitle="验证录音、播放和 PCM16 转换是否能在真机链路中稳定工作。" />

      <Card className="mb-4 border border-border bg-surface p-4" style={{ borderColor: AppPalette.border, borderRadius: 18 }}>
        <Card.Body className="gap-4">
          <Text className="text-lg font-black text-foreground">Recorder</Text>
          <View className="flex-row gap-3">
            <Button className="flex-1" isDisabled={isRecording} onPress={startRecording} variant="primary">
              开始录音
            </Button>
            <Button className="flex-1" isDisabled={!isRecording} onPress={stopRecording} variant="secondary">
              停止
            </Button>
          </View>
          <View className="flex-row flex-wrap gap-3">
            <MetricCard label="请求采样率" value={`${recorderStats.requestedSampleRate}`} />
            <MetricCard label="实际采样率" value={`${recorderStats.actualSampleRate ?? '-'}`} />
            <MetricCard label="请求样本" value={`${recorderStats.requestedBufferLength}`} />
            <MetricCard label="实际 chunk" value={`${recorderStats.actualChunkMs ?? '-'}ms`} />
            <MetricCard label="帧数" value={`${recorderStats.framesReceived}`} />
            <MetricCard label="音量" value={`${lastFrame?.level ?? recorderStats.lastLevel}`} />
          </View>
          <Text className="text-sm font-semibold text-muted">状态：{recorderStatus}</Text>
        </Card.Body>
      </Card>

      <Card className="mb-4 border border-border bg-surface p-4" style={{ borderColor: AppPalette.border, borderRadius: 18 }}>
        <Card.Body className="gap-4">
          <Text className="text-lg font-black text-foreground">Player</Text>
          <View className="flex-row gap-3">
            <Button className="flex-1" onPress={playTone} variant="primary">
              队列播放
            </Button>
            <Button className="flex-1" onPress={playSourceTone} variant="secondary">
              Source 测试
            </Button>
          </View>
          <View className="flex-row gap-3">
            <Button className="flex-1" onPress={playRecentRecording} variant="primary">
              播放录音
            </Button>
            <Button className="flex-1" onPress={clearPlayer} variant="secondary">
              清空队列
            </Button>
          </View>
          <Button onPress={() => void playerRef.current.close()} variant="outline">
            关闭音频
          </Button>
          <View className="flex-row flex-wrap gap-3">
            <MetricCard label="入队片段" value={`${playerStats.enqueuedBuffers}`} />
            <MetricCard label="采样率" value={`${playerStats.sampleRate ?? '-'}`} />
            <MetricCard label="片段时长" value={`${playerStats.lastBufferDurationMs ?? '-'}ms`} />
            <MetricCard label="输出格式" value="PCM16" />
          </View>
          <Text className="text-sm font-semibold text-muted">状态：{playerStatus}</Text>
        </Card.Body>
      </Card>

      <Card className="mb-4 border border-border bg-surface-secondary p-4" style={{ borderColor: AppPalette.border, borderRadius: 18 }}>
        <Card.Body className="gap-2">
          <Text className="text-lg font-black text-foreground">Spike 结论</Text>
          <Text className="text-sm leading-5 text-muted">
            需要使用 Development Build 和真机验证。Expo Go 或 Web 可能无法加载原生音频模块。
          </Text>
          <Text className="text-sm leading-5 text-muted">
            当前项目仍存在 worklets peer 风险：audio-api 要求大于等于 0.6.0，当前为 0.5.1。
          </Text>
        </Card.Body>
      </Card>

    </ScrollView>
  );
}

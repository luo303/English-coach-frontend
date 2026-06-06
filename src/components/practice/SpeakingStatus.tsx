import { StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { AudioLevelMeter } from '@/components/practice/AudioLevelMeter';
import { PracticeSessionState } from '@/types/practice';

type SpeakingStatusProps = {
  elapsedSec: number;
  level: number;
  status: PracticeSessionState;
};

const statusCopy: Record<PracticeSessionState, string> = {
  assistant_speaking: 'AI 正在回应 · 可随时打断',
  assistant_thinking: 'AI 正在组织追问',
  connecting: '正在连接实时通道',
  ending: '正在结束会话',
  error: '实时通道异常',
  idle: '准备开始',
  interrupting: '已打断 AI · 等待你继续',
  listening: '请继续说 · 停顿后 AI 接话',
  report_generating: '正在生成课后报告',
  user_speaking: '实时转写中 · 保持自然表达',
};

export function SpeakingStatus({ elapsedSec, level, status }: SpeakingStatusProps) {
  const minutes = Math.floor(elapsedSec / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (elapsedSec % 60).toString().padStart(2, '0');

  return (
    <View style={styles.micPanel}>
      <View style={[styles.waveRing, status === 'user_speaking' && styles.waveRingActive]}>
        <View style={styles.waveDot} />
      </View>
      <AudioLevelMeter level={level} />
      <Text style={styles.micStatus}>{statusCopy[status]}</Text>
      <Text style={styles.timer}>{minutes}:{seconds}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  micPanel: {
    alignItems: 'center',
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 260,
    padding: 22,
  },
  waveRing: {
    alignItems: 'center',
    backgroundColor: AppPalette.blue,
    borderColor: AppPalette.blueSoft,
    borderRadius: 64,
    borderWidth: 10,
    height: 118,
    justifyContent: 'center',
    marginBottom: 18,
    width: 118,
  },
  waveRingActive: {
    shadowColor: AppPalette.blue,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  waveDot: {
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  micStatus: {
    color: AppPalette.ink,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  timer: {
    color: AppPalette.muted,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8,
  },
});

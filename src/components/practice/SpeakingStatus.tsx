import { Card, Chip, Typography } from 'heroui-native';
import { View } from 'react-native';

import { AudioLevelMeter } from '@/components/practice/AudioLevelMeter';
import { AppPalette } from '@/constants/appPalette';
import { PracticeSessionState } from '@/types/realtime';

type SpeakingStatusProps = {
  elapsedSec: number;
  level: number;
  status: PracticeSessionState;
};

const statusCopy: Record<PracticeSessionState, string> = {
  assistant_speaking: 'AI 回应中',
  assistant_thinking: '思考中',
  connecting: '连接中',
  ending: '收尾中',
  error: '连接异常',
  idle: '准备中',
  interrupting: '已打断',
  listening: '正在听',
  report_generating: '生成报告',
  summary_ready: '报告完成',
  user_speaking: '转写中',
};

export function SpeakingStatus({ elapsedSec, level, status }: SpeakingStatusProps) {
  const minutes = Math.floor(elapsedSec / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (elapsedSec % 60).toString().padStart(2, '0');
  const isActive = status === 'user_speaking' || status === 'assistant_speaking';

  return (
    <Card
      className="border border-border bg-surface p-5 shadow-surface"
      style={{ backgroundColor: AppPalette.surface, borderColor: AppPalette.border, borderRadius: 28 }}
    >
      <Card.Body className="items-center gap-4">
        <View
          className="h-32 w-32 items-center justify-center rounded-full"
          style={{ backgroundColor: isActive ? AppPalette.primary : AppPalette.surfaceSoft, borderRadius: 999 }}
        >
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 999, height: 14, width: 14 }} />
        </View>
        <AudioLevelMeter level={level} />
        <View className="flex-row items-center gap-3">
          <Chip color={isActive ? 'accent' : 'default'} variant="soft">
            {statusCopy[status]}
          </Chip>
          <Typography.Code>{minutes}:{seconds}</Typography.Code>
        </View>
      </Card.Body>
    </Card>
  );
}

import { Card, Chip, Typography as Text } from 'heroui-native';
import { View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';

type SummaryCardProps = {
  score: number;
  summary: string;
  title: string;
};

export function SummaryCard({ score, summary, title }: SummaryCardProps) {
  return (
    <Card
      className="mb-4 border border-border bg-surface p-5"
      style={{ backgroundColor: AppPalette.surface, borderColor: AppPalette.border, borderRadius: 18 }}
    >
      <Card.Body className="gap-4">
        <View className="flex-row items-center gap-4">
          <View className="h-20 w-20 items-center justify-center rounded-2xl bg-accent" style={{ backgroundColor: AppPalette.primary, borderRadius: 18 }}>
            <Text className="text-3xl font-black text-accent-foreground" style={{ color: '#FFFFFF' }}>
              {Math.round(score)}
            </Text>
          </View>
          <View className="flex-1">
            <Chip color="success" size="sm" variant="soft" className="mb-2 self-start">
              报告已生成
            </Chip>
            <Text className="text-xl font-black leading-7 text-foreground" style={{ color: AppPalette.foreground }}>
              {title}
            </Text>
          </View>
        </View>
        <Text className="text-base leading-6 text-muted" numberOfLines={2} style={{ color: AppPalette.muted }}>
          {summary}
        </Text>
      </Card.Body>
    </Card>
  );
}

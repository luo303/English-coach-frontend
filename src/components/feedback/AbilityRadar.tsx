import { Card, Typography as Text } from 'heroui-native';
import { View } from 'react-native';

import { Metric } from '@/types/practice';

type AbilityRadarProps = {
  metrics: Metric[];
};

export function AbilityRadar({ metrics }: AbilityRadarProps) {
  return (
    <Card className="mb-4 border border-border bg-surface p-4">
      <Card.Body className="gap-4">
        <Text className="text-lg font-black text-foreground">能力分布</Text>
        {metrics.length === 0 ? <Text className="text-base text-muted">暂无能力指标。</Text> : null}
        {metrics.map((metric) => (
          <View key={metric.label} className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-[15px] font-semibold text-muted">{metric.label}</Text>
              <Text className="text-[15px] font-black text-foreground">{metric.value}</Text>
            </View>
            <View className="h-2.5 overflow-hidden rounded-full bg-surface-tertiary">
              <View className="h-full rounded-full bg-accent" style={{ width: `${metric.value}%` }} />
            </View>
          </View>
        ))}
      </Card.Body>
    </Card>
  );
}

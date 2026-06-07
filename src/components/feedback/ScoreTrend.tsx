import { Card, Chip, Typography as Text } from 'heroui-native';
import { View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { HistoryRecord } from '@/types/practice';

type ScoreTrendProps = {
  record: HistoryRecord;
};

export function ScoreTrend({ record }: ScoreTrendProps) {
  return (
    <Card
      className="mb-3 border border-border bg-surface p-4"
      style={{ backgroundColor: AppPalette.surface, borderColor: AppPalette.border, borderRadius: 18 }}
    >
      <Card.Body className="gap-4">
        <View className="flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-lg font-black text-foreground" style={{ color: AppPalette.foreground }}>
            {record.title}
          </Text>
          <Chip color="accent" size="sm" variant="soft">
            {record.delta}
          </Chip>
        </View>
        <View className="flex-row justify-between gap-3 border-t border-border pt-3" style={{ borderColor: AppPalette.separator }}>
          <HistoryStat label="总分" value={String(record.score)} />
          <HistoryStat label="时长" value={record.time} />
          <HistoryStat label="轮次" value={String(record.expression)} />
        </View>
      </Card.Body>
    </Card>
  );
}

function HistoryStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-20">
      <Text className="mb-1 text-sm font-semibold text-muted" style={{ color: AppPalette.muted }}>
        {label}
      </Text>
      <Text className="text-base font-black text-foreground" style={{ color: AppPalette.foreground }}>
        {value}
      </Text>
    </View>
  );
}

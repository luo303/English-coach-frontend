import { Accordion, Button, Chip, Typography } from 'heroui-native';
import { View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { Scenario } from '@/types/practice';

type ScenarioCardProps = {
  scenario: Scenario;
  onStart: () => void;
};

export function ScenarioCard({ scenario, onStart }: ScenarioCardProps) {
  return (
    <Accordion.Item value={scenario.id}>
      <Accordion.Trigger>
        <View className="flex-1 flex-row items-center justify-between gap-3">
          <Typography className="flex-1 text-base font-black text-foreground" numberOfLines={1} style={{ color: AppPalette.foreground }}>
            {scenario.title}
          </Typography>
          <Chip color="default" size="sm" variant="soft">
            {scenario.level}
          </Chip>
        </View>
        <Accordion.Indicator />
      </Accordion.Trigger>
      <Accordion.Content>
        <View className="gap-4 px-1 pb-4">
          <Typography className="text-[15px] leading-6 text-muted" style={{ color: AppPalette.muted }}>
            {scenario.subtitle}
          </Typography>
          <View className="flex-row flex-wrap gap-2">
            {scenario.focus.slice(0, 2).map((item) => (
              <Chip key={item} color="default" size="sm" variant="secondary">
                {item}
              </Chip>
            ))}
            <Chip color="success" size="sm" variant="soft">
              {scenario.minutes} 分钟
            </Chip>
          </View>
          <Button onPress={onStart} size="sm" variant="primary">
            开始这个场景
          </Button>
        </View>
      </Accordion.Content>
    </Accordion.Item>
  );
}

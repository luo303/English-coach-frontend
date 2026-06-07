import { View } from 'react-native';

type AudioLevelMeterProps = {
  level: number;
  compact?: boolean;
  color?: string;
};

export function AudioLevelMeter({ color, compact = false, level }: AudioLevelMeterProps) {
  const levelBars = [0.42, 0.78, 0.58, 0.88, 0.64].map((ratio, index) => {
    const pulse = index % 2 === 0 ? (compact ? 3 : 8) : compact ? -2 : -4;
    const min = compact ? 8 : 18;
    const max = compact ? 30 : 92;
    return Math.max(min, Math.min(max, level * ratio + pulse));
  });

  return (
    <View className={`${compact ? 'h-8 gap-1' : 'mb-1 h-24 gap-2'} flex-row items-end justify-center`}>
      {levelBars.map((height, index) => (
        <View
          key={`level-${index}`}
          className={`${compact ? 'w-1' : 'w-2'} rounded-full bg-accent`}
          style={{ backgroundColor: color, height }}
        />
      ))}
    </View>
  );
}

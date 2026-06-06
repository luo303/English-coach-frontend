import { StyleSheet, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';

type AudioLevelMeterProps = {
  level: number;
};

export function AudioLevelMeter({ level }: AudioLevelMeterProps) {
  const levelBars = [0.42, 0.78, 0.58, 0.88, 0.64].map((ratio, index) => {
    const pulse = index % 2 === 0 ? 8 : -4;
    return Math.max(18, Math.min(92, level * ratio + pulse));
  });

  return (
    <View style={styles.levelBars}>
      {levelBars.map((height, index) => (
        <View key={`level-${index}`} style={[styles.levelBar, { height }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  levelBars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    height: 92,
    justifyContent: 'center',
    marginBottom: 10,
  },
  levelBar: {
    backgroundColor: AppPalette.blue,
    borderRadius: 999,
    width: 8,
  },
});

import { StyleSheet, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';

const levelBars = [42, 78, 58, 88, 64];

export function AudioLevelMeter() {
  return (
    <View style={styles.levelBars}>
      {levelBars.map((height, index) => (
        <View key={`${height}-${index}`} style={[styles.levelBar, { height }]} />
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

import { StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { AudioLevelMeter } from '@/components/practice/AudioLevelMeter';

export function SpeakingStatus() {
  return (
    <View style={styles.micPanel}>
      <View style={styles.waveRing}>
        <View style={styles.waveDot} />
      </View>
      <AudioLevelMeter />
      <Text style={styles.micStatus}>实时转写中 · 停顿后 AI 接话</Text>
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
});

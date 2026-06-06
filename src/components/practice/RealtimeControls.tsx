import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { PracticeSessionState } from '@/types/practice';

type RealtimeControlsProps = {
  onInterrupt: () => void;
  onEnd: () => void;
  status: PracticeSessionState;
};

export function RealtimeControls({ onEnd, onInterrupt, status }: RealtimeControlsProps) {
  const canInterrupt = status === 'assistant_speaking';

  return (
    <View style={styles.controlRow}>
      <Pressable
        disabled={!canInterrupt}
        onPress={onInterrupt}
        style={[styles.secondaryButton, !canInterrupt && styles.disabledButton]}
      >
        <Text style={[styles.secondaryButtonText, !canInterrupt && styles.disabledButtonText]}>打断 AI</Text>
      </Pressable>
      <Pressable onPress={onEnd} style={styles.dangerButton}>
        <Text style={styles.dangerButtonText}>结束会话</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controlRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryButtonText: {
    color: AppPalette.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.56,
  },
  disabledButtonText: {
    color: AppPalette.faint,
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: '#FFF1F1',
    borderColor: '#FFD1D1',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  dangerButtonText: {
    color: AppPalette.red,
    fontSize: 16,
    fontWeight: '900',
  },
});

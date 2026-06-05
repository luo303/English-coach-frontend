import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { RealtimeControls } from '@/components/practice/RealtimeControls';
import { SpeakingStatus } from '@/components/practice/SpeakingStatus';
import { TranscriptPanel } from '@/components/practice/TranscriptPanel';
import { Scenario } from '@/types/practice';

type PracticeScreenProps = {
  scenario: Scenario;
  onEnd: () => void;
};

export function PracticeScreen({ scenario, onEnd }: PracticeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ScreenTitle eyebrow={`${scenario.title} · 低延迟通道`} title="实时对话" action="Ⅱ" />

      <View style={styles.connectionCard}>
        <Text style={styles.connectionTitle}>WebSocket 语音流</Text>
        <Text style={styles.latency}>221ms</Text>
      </View>

      <TranscriptPanel />
      <SpeakingStatus />
      <RealtimeControls onEnd={onEnd} />
    </ScrollView>
  );
}

function ScreenTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action: string }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Pressable accessibilityRole="button" style={styles.headerAction}>
        <Text style={styles.headerActionText}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 92,
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: AppPalette.muted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
  },
  title: {
    color: AppPalette.ink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 34,
  },
  headerAction: {
    alignItems: 'center',
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    shadowColor: '#B8C2D6',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    width: 46,
  },
  headerActionText: {
    color: AppPalette.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  connectionCard: {
    alignItems: 'center',
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 16,
  },
  connectionTitle: {
    color: AppPalette.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  latency: {
    color: AppPalette.green,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
  },
});

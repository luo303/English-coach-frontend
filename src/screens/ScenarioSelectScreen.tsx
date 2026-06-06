import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { DifficultySelector } from '@/components/scenario/DifficultySelector';
import { ScenarioCard } from '@/components/scenario/ScenarioCard';
import { scenarios } from '@/data/practiceMock';

type ScenarioSelectScreenProps = {
  selectedScenario: string;
  onSelectScenario: (id: string) => void;
  onStart: () => void;
};

export function ScenarioSelectScreen({
  selectedScenario,
  onSelectScenario,
  onStart,
}: ScenarioSelectScreenProps) {
  const currentScenario = scenarios.find((scenario) => scenario.id === selectedScenario) ?? scenarios[0];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ScreenTitle eyebrow="今日建议" title="场景训练" action="⌾" />

      <View style={styles.coachCard}>
        <View style={styles.coachAccent} />
        <Text style={styles.coachTitle}>先练 1 个高频场景</Text>
        <Text style={styles.coachText}>系统会根据你的历史错句，在对话中插入自然追问。</Text>
      </View>

      <DifficultySelector />

      <View style={styles.scenarioList}>
        {scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            selected={selectedScenario === scenario.id}
            onPress={() => onSelectScenario(scenario.id)}
          />
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={onStart} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>开始{currentScenario.title}模拟</Text>
      </Pressable>
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
  coachCard: {
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    padding: 18,
  },
  coachAccent: {
    backgroundColor: AppPalette.blue,
    borderRadius: 999,
    height: 5,
    marginBottom: 14,
    width: 54,
  },
  coachTitle: {
    color: AppPalette.ink,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 8,
  },
  coachText: {
    color: AppPalette.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  scenarioList: {
    gap: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: AppPalette.blue,
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 56,
    shadowColor: AppPalette.blue,
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});

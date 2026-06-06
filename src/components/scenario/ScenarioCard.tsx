import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { Scenario } from '@/types/practice';

type ScenarioCardProps = {
  scenario: Scenario;
  selected: boolean;
  onPress: () => void;
};

export function ScenarioCard({ scenario, selected, onPress }: ScenarioCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.cardActive]}>
      <View style={styles.cardTop}>
        <Text style={styles.title}>{scenario.title}</Text>
        <View style={[styles.levelBadge, selected && styles.levelBadgeActive]}>
          <Text style={[styles.levelText, selected && styles.levelTextActive]}>{scenario.level}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{scenario.subtitle}</Text>
      <View style={styles.focusRow}>
        {scenario.focus.map((item) => (
          <Text key={item} style={styles.focusChip}>
            {item}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 18,
    borderWidth: 1,
    padding: 17,
  },
  cardActive: {
    backgroundColor: '#F8FBFF',
    borderColor: AppPalette.blue,
    borderWidth: 2,
    shadowColor: '#9AB8FF',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: AppPalette.ink,
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
  },
  levelBadge: {
    backgroundColor: AppPalette.blueSoft,
    borderColor: '#C8D8FF',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  levelBadgeActive: {
    backgroundColor: AppPalette.blue,
    borderColor: AppPalette.blue,
  },
  levelText: {
    color: AppPalette.blue,
    fontSize: 14,
    fontWeight: '900',
  },
  levelTextActive: {
    color: '#FFFFFF',
  },
  subtitle: {
    color: AppPalette.muted,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 12,
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  focusChip: {
    backgroundColor: '#F0F3F8',
    borderRadius: 999,
    color: AppPalette.muted,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';

type SummaryCardProps = {
  score: number;
  summary: string;
  title: string;
};

export function SummaryCard({ score, summary, title }: SummaryCardProps) {
  return (
    <View style={styles.scoreHero}>
      <View style={styles.scoreOrb}>
        <Text style={styles.scoreNumber}>{Math.round(score)}</Text>
      </View>
      <View style={styles.scoreCopy}>
        <Text style={styles.scoreTitle}>{title}</Text>
        <Text style={styles.scoreText}>{summary}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreHero: {
    alignItems: 'center',
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 18,
    marginBottom: 14,
    padding: 18,
  },
  scoreOrb: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: AppPalette.blue,
    borderRadius: 50,
    borderWidth: 12,
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  scoreNumber: {
    color: AppPalette.ink,
    fontSize: 27,
    fontWeight: '900',
  },
  scoreCopy: {
    flex: 1,
  },
  scoreTitle: {
    color: AppPalette.ink,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
    marginBottom: 6,
  },
  scoreText: {
    color: AppPalette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});

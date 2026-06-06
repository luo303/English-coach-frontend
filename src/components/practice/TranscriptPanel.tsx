import { StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { RealtimeHint, RealtimeScoreSnapshot, TranscriptTurn } from '@/types/practice';

type TranscriptPanelProps = {
  hints: RealtimeHint[];
  partialTurn?: TranscriptTurn | null;
  score: RealtimeScoreSnapshot;
  turns: TranscriptTurn[];
};

const hintColors: Record<RealtimeHint['type'], { background: string; border: string }> = {
  expression: { background: AppPalette.greenSoft, border: '#BCE7CC' },
  grammar: { background: '#FFF0F5', border: '#FFD1E1' },
  pronunciation: { background: AppPalette.amberSoft, border: '#F4D58B' },
  timing: { background: AppPalette.amberSoft, border: '#F4D58B' },
};

export function TranscriptPanel({ hints, partialTurn, score, turns }: TranscriptPanelProps) {
  const visibleTurns = partialTurn ? [...turns, partialTurn] : turns;

  return (
    <>
      <View style={styles.scoreCard}>
        <View>
          <Text style={styles.scoreLabel}>实时表现</Text>
          <Text style={styles.scoreValue}>{score.overall}</Text>
        </View>
        <View style={styles.scorePillRow}>
          <Text style={styles.scorePill}>发音 {score.pronunciation}</Text>
          <Text style={styles.scorePill}>语法 {score.grammar}</Text>
          <Text style={styles.scorePill}>流利 {score.fluency}</Text>
        </View>
      </View>

      {visibleTurns.map((turn) => {
        const isAssistant = turn.speaker === 'assistant';
        return (
          <View
            key={`${turn.turnId}-${turn.isFinal ? 'final' : 'partial'}`}
            style={[styles.chatBubble, isAssistant ? styles.chatBubbleLeft : styles.chatBubbleRight]}
          >
            <Text style={styles.speakerLabel}>{isAssistant ? 'AI Coach' : 'You'}</Text>
            <Text style={[styles.chatText, !turn.isFinal && styles.partialText]}>{turn.text}</Text>
          </View>
        );
      })}

      {hints.map((hint) => {
        const colors = hintColors[hint.type];
        return (
          <View
            key={hint.id}
            style={[styles.coachNote, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <Text style={styles.noteTitle}>{hint.title}</Text>
            <Text style={styles.noteText}>{hint.message}</Text>
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  scoreCard: {
    alignItems: 'center',
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 15,
  },
  scoreLabel: {
    color: AppPalette.muted,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  scoreValue: {
    color: AppPalette.ink,
    fontSize: 30,
    fontWeight: '900',
  },
  scorePillRow: {
    alignItems: 'flex-end',
    gap: 6,
  },
  scorePill: {
    backgroundColor: AppPalette.blueSoft,
    borderRadius: 999,
    color: AppPalette.blue,
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  chatBubble: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 15,
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    maxWidth: '84%',
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: AppPalette.blueSoft,
    borderColor: '#BFD2FF',
    maxWidth: '86%',
  },
  speakerLabel: {
    color: AppPalette.faint,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  chatText: {
    color: AppPalette.ink,
    fontSize: 17,
    lineHeight: 24,
  },
  partialText: {
    color: AppPalette.muted,
    fontStyle: 'italic',
  },
  coachNote: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 15,
  },
  noteTitle: {
    color: AppPalette.ink,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },
  noteText: {
    color: AppPalette.ink,
    fontSize: 15,
    lineHeight: 22,
  },
});

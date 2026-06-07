import { Alert, Chip, Surface, Typography } from 'heroui-native';
import { useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { RealtimeHint, RealtimeScoreSnapshot, TranscriptTurn } from '@/types/realtime';

type TranscriptPanelProps = {
  hints: RealtimeHint[];
  partialTurn?: TranscriptTurn | null;
  score: RealtimeScoreSnapshot;
  turns: TranscriptTurn[];
};

const hintStatus: Record<RealtimeHint['type'], 'default' | 'accent' | 'success' | 'warning' | 'danger'> = {
  expression: 'success',
  grammar: 'danger',
  pronunciation: 'warning',
  system: 'default',
  timing: 'warning',
};

const callRoom = {
  border: '#21342F',
  bubbleAi: '#12241F',
  bubbleUser: '#DFF5F0',
  ink: '#F4FBF8',
  muted: '#9FB8B0',
  panel: '#0B1714',
  panelSoft: '#10211D',
  userInk: '#F7FAFC',
};

export function TranscriptPanel({ hints, partialTurn, score, turns }: TranscriptPanelProps) {
  const visibleTurns = partialTurn ? [...turns, partialTurn] : turns;
  const latestTurn = visibleTurns[visibleTurns.length - 1] ?? null;
  const visibleHints = hints.filter((hint) => hint.type !== 'system');
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [visibleTurns.length, partialTurn?.text]);

  return (
    <View className="flex-1 gap-3">
      <Surface
        className="flex-1 overflow-hidden border px-4 pb-4 pt-3"
        style={{ backgroundColor: callRoom.panel, borderColor: callRoom.border, borderRadius: 22 }}
      >
        <View className="mb-3 flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-2">
            <Typography className="text-2xl font-black" style={{ color: callRoom.ink }}>
              {score.overall}
            </Typography>
            <Typography className="text-xs font-semibold" style={{ color: callRoom.muted }}>
              实时分
            </Typography>
          </View>
          <View className="flex-row gap-2">
            <Chip color="accent" size="sm" variant="soft">
              发音 {score.pronunciation}
            </Chip>
            <Chip color="success" size="sm" variant="soft">
              流利 {score.fluency}
            </Chip>
          </View>
        </View>

        {latestTurn ? (
          <View
            className="mb-3 border px-4 py-4"
            style={{
              backgroundColor: latestTurn.speaker === 'assistant' ? callRoom.panelSoft : AppPalette.primarySoft,
              borderColor: latestTurn.speaker === 'assistant' ? callRoom.border : AppPalette.primary,
              borderRadius: 18,
            }}
          >
            <Typography className="mb-2 text-xs font-black" style={{ color: latestTurn.speaker === 'assistant' ? callRoom.muted : AppPalette.primary }}>
              {latestTurn.speaker === 'assistant' ? 'AI Coach' : 'You'}
            </Typography>
            <Typography
              className={`${latestTurn.isFinal ? '' : 'italic'} text-2xl font-black leading-9`}
              style={{
                color: latestTurn.speaker === 'assistant' ? callRoom.ink : callRoom.userInk,
                fontSize: 24,
                lineHeight: 34,
              }}
            >
              {latestTurn.text}
            </Typography>
          </View>
        ) : null}

        <ScrollView
          ref={scrollRef}
          contentContainerClassName="gap-3 pb-5"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {visibleTurns.length === 0 ? (
            <View className="min-h-96 justify-center">
              <Typography className="text-center text-3xl font-black leading-10" style={{ color: callRoom.ink }}>
                字幕会显示在这里
              </Typography>
              <Typography className="mt-3 text-center text-base leading-6" style={{ color: callRoom.muted }}>
                开始说话后，字幕会自动滚动。
              </Typography>
            </View>
          ) : null}

          {visibleTurns.map((turn) => {
            const isAssistant = turn.speaker === 'assistant';
            const isLatest = latestTurn?.turnId === turn.turnId && latestTurn?.isFinal === turn.isFinal;
            return (
              <View
                key={`${turn.turnId}-${turn.isFinal ? 'final' : 'partial'}`}
                className={`max-w-[88%] border px-4 py-3 ${isAssistant ? 'self-start' : 'self-end'}`}
                style={{
                  alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                  backgroundColor: isAssistant ? callRoom.bubbleAi : AppPalette.primarySoft,
                  borderColor: isAssistant ? callRoom.border : '#9EDACE',
                  borderRadius: 16,
                  maxWidth: '88%',
                  opacity: isLatest ? 0.45 : 1,
                }}
              >
                <Typography className="mb-1 text-xs font-black" style={{ color: isAssistant ? callRoom.muted : AppPalette.primary }}>
                  {isAssistant ? 'AI Coach' : 'You'}
                </Typography>
                <Typography
                  className={`text-base leading-6 ${turn.isFinal ? '' : 'italic'}`}
                  style={{ color: isAssistant ? callRoom.ink : callRoom.userInk, fontSize: 16, lineHeight: 24 }}
                >
                  {turn.text}
                </Typography>
              </View>
            );
          })}
        </ScrollView>
      </Surface>

      {visibleHints.slice(-1).map((hint) => (
        <Alert className="py-3" key={hint.id} status={hintStatus[hint.type]}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{hint.title}</Alert.Title>
            <Alert.Description>{hint.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      ))}
    </View>
  );
}

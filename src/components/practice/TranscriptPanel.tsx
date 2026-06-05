import { StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';

export function TranscriptPanel() {
  return (
    <>
      <View style={styles.chatBubbleLeft}>
        <Text style={styles.chatText}>Can you summarize what blocked the release this week?</Text>
      </View>
      <View style={styles.chatBubbleRight}>
        <Text style={styles.chatText}>The QA found two critical bugs and we need one more day to verify.</Text>
      </View>
      <View style={styles.coachNote}>
        <Text style={styles.noteTitle}>时机控制</Text>
        <Text style={styles.noteText}>表达正确，暂不打断。课后加入 “risk mitigation” 表达拓展。</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  chatBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    maxWidth: '84%',
    padding: 15,
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: AppPalette.blueSoft,
    borderColor: '#BFD2FF',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    maxWidth: '86%',
    padding: 15,
  },
  chatText: {
    color: AppPalette.ink,
    fontSize: 17,
    lineHeight: 24,
  },
  coachNote: {
    backgroundColor: AppPalette.amberSoft,
    borderColor: '#F4D58B',
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

import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.eyebrow, { color: colors.tint }]}>AI English Partner</Text>
      <Text style={[styles.title, { color: colors.text }]}>Ready to build.</Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        This project has been cleaned back to a minimal Expo Router starting point.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: 14,
  },
  description: {
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 360,
  },
});

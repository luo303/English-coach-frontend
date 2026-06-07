import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { HeroUINativeProvider } from 'heroui-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import '../../global.css';
import { AppPalette } from '@/constants/appPalette';

export default function RootLayout() {
  useEffect(() => {
    Uniwind.setTheme('dark');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeroUINativeProvider
          config={{
            devInfo: {
              stylingPrinciples: false,
            },
            textProps: {
              allowFontScaling: true,
              maxFontSizeMultiplier: 1.25,
            },
          }}
        >
          <ThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
            <StatusBar backgroundColor={AppPalette.background} style="light" />
          </ThemeProvider>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

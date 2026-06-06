import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { ApiRuntimeConfig } from '@/config/runtime';
import { useAuthStore } from '@/state/authStore';

export function LoginScreen() {
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const isLoading = status === 'loading';

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>AI English Partner</Text>
        <Text style={styles.title}>登录后开始练习</Text>
        <Text style={styles.subtitle}>当前默认进入模拟环境；真实后端登录链路已保留，联调时再切换。</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>匿名身份</Text>
        <Text style={styles.panelText}>进入 App 前必须先登录。模拟登录会生成本地 token 和匿名用户。</Text>
        <Text style={styles.apiText}>API {ApiRuntimeConfig.apiBaseUrl}</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable disabled={isLoading} onPress={() => void login()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{isLoading ? '登录中...' : '模拟匿名登录'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: AppPalette.page,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 22,
  },
  eyebrow: {
    color: AppPalette.blue,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  title: {
    color: AppPalette.ink,
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    color: AppPalette.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  panel: {
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  panelTitle: {
    color: AppPalette.ink,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  panelText: {
    color: AppPalette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  apiText: {
    color: AppPalette.faint,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 16,
  },
  errorText: {
    color: AppPalette.red,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: AppPalette.blue,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 54,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
});

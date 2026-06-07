import { Button, Chip, Typography } from 'heroui-native';
import { View } from 'react-native';

import { ElevatedCard, Screen } from '@/components/ui/AppLayout';
import { AppPalette } from '@/constants/appPalette';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuthStore } from '@/state/authStore';

export function LoginScreen() {
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const isLoading = status === 'loading';
  useErrorToast({ message: error, title: '登录失败' });

  return (
    <Screen bottomInset={0}>
      <View
        className="flex-1 justify-center px-5"
        style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}
      >
        <View className="mb-8 items-center gap-4">
          <Chip color="accent" size="sm" variant="soft" className="self-center">
            AI English Partner
          </Chip>
          <Typography.Heading
            className="text-center text-4xl font-black leading-[42px] text-foreground"
            style={{ color: AppPalette.foreground, fontSize: 34, fontWeight: '900', lineHeight: 42, textAlign: 'center' }}
          >
            开口练英语
          </Typography.Heading>
          <Typography className="text-center text-base leading-6 text-muted" style={{ color: AppPalette.muted, textAlign: 'center' }}>
            场景对话，实时字幕，练完复盘。
          </Typography>
        </View>

        <ElevatedCard>
          <View className="gap-4">
            <View>
              <Typography className="text-center text-xl font-black text-foreground" style={{ color: AppPalette.foreground, textAlign: 'center' }}>
                开始匿名练习
              </Typography>
            </View>

            <Button isDisabled={isLoading} onPress={() => void login()} size="lg" variant="primary">
              {isLoading ? '登录中...' : '开始练习'}
            </Button>
          </View>
        </ElevatedCard>
      </View>
    </Screen>
  );
}

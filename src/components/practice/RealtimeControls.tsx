import { Button, Menu } from 'heroui-native';
import { View } from 'react-native';

import { PracticeSessionState } from '@/types/realtime';

type RealtimeControlsProps = {
  onInterrupt: () => void;
  onEnd: () => void;
  status: PracticeSessionState;
};

const callRoom = {
  border: '#29423B',
  panel: '#10211D',
};

export function RealtimeControls({ onEnd, onInterrupt, status }: RealtimeControlsProps) {
  const canInterrupt = status === 'assistant_speaking';

  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button
          className="h-12 w-12 border"
          isIconOnly
          size="lg"
          style={{ backgroundColor: callRoom.panel, borderColor: callRoom.border, borderRadius: 999 }}
          variant="secondary"
        >
          <Button.Label className="text-xl leading-5">⋯</Button.Label>
        </Button>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Overlay className="bg-transparent" />
        <Menu.Content align="end" className="border border-border bg-surface" offset={12} placement="top" presentation="popover" width={260}>
          <Menu.Label className="mb-1">通话控制</Menu.Label>
          {canInterrupt ? (
            <Menu.Item className="items-start" onPress={onInterrupt}>
              <View className="flex-1">
                <Menu.ItemTitle>打断 AI</Menu.ItemTitle>
                <Menu.ItemDescription>暂停当前回复，继续补充你的表达。</Menu.ItemDescription>
              </View>
            </Menu.Item>
          ) : null}
          <Menu.Item className="items-start" onPress={() => void onEnd()} variant="danger">
            <View className="flex-1">
              <Menu.ItemTitle>结束并生成报告</Menu.ItemTitle>
              <Menu.ItemDescription>保存本次练习并进入复盘页。</Menu.ItemDescription>
            </View>
          </Menu.Item>
          <Menu.Item className="items-start">
            <View className="flex-1">
              <Menu.ItemTitle>继续练习</Menu.ItemTitle>
              <Menu.ItemDescription>关闭菜单，回到实时字幕。</Menu.ItemDescription>
            </View>
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu>
  );
}

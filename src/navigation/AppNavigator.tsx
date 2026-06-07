import { useEffect, useMemo, useState } from 'react';
import { Surface, Tabs } from 'heroui-native';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchScenarios } from '@/clients/scenarioClient';
import { AppPalette } from '@/constants/appPalette';
import { AudioSpikeScreen } from '@/screens/AudioSpikeScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { PracticeScreen } from '@/screens/PracticeScreen';
import { ScenarioSelectScreen } from '@/screens/ScenarioSelectScreen';
import { SessionSummaryScreen } from '@/screens/SessionSummaryScreen';
import { useAuthStore } from '@/state/authStore';
import { ScenarioRecord } from '@/types/api';
import { Scenario, TabItem, TabKey } from '@/types/practice';
import { debugLog } from '@/utils/debugLog';

const TAB_BAR_HEIGHT = 70;

const tabs: TabItem[] = [
  { key: 'practice', label: '练习' },
  { key: 'history', label: '复盘' },
  { key: 'audio', label: '音频' },
];

const tabKeys = tabs.map((tab) => tab.key);

function toScenario(record: ScenarioRecord): Scenario {
  return {
    correctionMode: record.correctionMode,
    defaultPersonaId: record.defaultPersonaId,
    focus: [record.difficulty, record.icon].filter(Boolean),
    id: record.scenarioId,
    level: record.difficulty,
    minutes: record.maxDurationMinutes,
    subtitle: record.description,
    title: `${record.nameZh || record.name} ${record.name}`.trim(),
  };
}

export function AppNavigator() {
  const [activeTab, setActiveTab] = useState<TabKey>('practice');
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated');
  const insets = useSafeAreaInsets();
  const isConversation = activeTab === 'conversation';
  const navValue = tabKeys.includes(activeTab) ? activeTab : 'practice';
  const currentScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenario) ?? scenarios[0] ?? null,
    [scenarios, selectedScenario],
  );

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setScenarioLoading(false);
      setScenarios([]);
      setSelectedScenario(null);
      return;
    }

    let cancelled = false;
    setScenarioError(null);
    setScenarioLoading(true);
    debugLog('SCENARIO', 'load scenarios start', {
      hasToken: Boolean(accessToken),
    });

    void fetchScenarios(accessToken)
      .then((records) => {
        if (cancelled) {
          return;
        }

        const nextScenarios = records.map(toScenario);
        debugLog('SCENARIO', 'load scenarios success', {
          count: nextScenarios.length,
          selectedScenarioId: nextScenarios[0]?.id ?? null,
        });
        setScenarios(nextScenarios);
        setScenarioLoading(false);
        setSelectedScenario((current) =>
          current && nextScenarios.some((scenario) => scenario.id === current) ? current : null,
        );
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setScenarioError(error instanceof Error ? error.message : '加载场景失败。');
        setScenarioLoading(false);
        debugLog('SCENARIO', 'load scenarios failed', {
          message: error instanceof Error ? error.message : String(error),
        });
        setScenarios([]);
        setSelectedScenario(null);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, isAuthenticated]);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1 bg-background"
      style={{ backgroundColor: isConversation ? '#06110F' : AppPalette.background, flex: 1 }}
    >
      {!isAuthenticated ? <LoginScreen /> : null}
      {isAuthenticated ? (
        <View className="flex-1 bg-background" style={{ backgroundColor: isConversation ? '#06110F' : AppPalette.background, flex: 1 }}>
          <View className="flex-1" style={{ flex: 1 }}>
            {activeTab === 'practice' ? (
              <ScenarioSelectScreen
                error={scenarioError}
                isLoading={scenarioLoading}
                scenarios={scenarios}
                selectedScenario={selectedScenario}
                onSelectScenario={setSelectedScenario}
                onStart={() => {
                  if (currentScenario) {
                    setActiveTab('conversation');
                  }
                }}
              />
            ) : null}
            {activeTab === 'conversation' && currentScenario ? (
              <PracticeScreen
                scenario={currentScenario}
                onEnd={(sessionId) => {
                  setLastSessionId(sessionId);
                  setActiveTab('summary');
                }}
              />
            ) : null}
            {activeTab === 'summary' ? (
              <SessionSummaryScreen sessionId={lastSessionId} onPracticeAgain={() => setActiveTab('practice')} />
            ) : null}
            {activeTab === 'history' ? <HistoryScreen /> : null}
            {activeTab === 'audio' ? <AudioSpikeScreen /> : null}
          </View>

          {isConversation ? null : (
            <Surface
              className="absolute bottom-0 left-0 right-0 border-t border-border px-5 pt-3"
              style={{
                backgroundColor: '#070B10',
                borderColor: AppPalette.border,
                height: TAB_BAR_HEIGHT + insets.bottom,
                paddingBottom: Math.max(insets.bottom, 8),
              }}
            >
              <Tabs
                className="w-full"
                value={navValue}
                variant="primary"
                onValueChange={(value) => setActiveTab(value as TabKey)}
              >
                <Tabs.List
                  className="rounded-full border px-1 py-1"
                  style={{ backgroundColor: '#24262C', borderColor: '#30343B' }}
                >
                  <Tabs.Indicator className="rounded-full" style={{ backgroundColor: '#414956' }} />
                {tabs.map((tab) => {
                  return (
                    <Tabs.Trigger className="flex-1 rounded-full px-4 py-2" key={tab.key} value={tab.key}>
                      {({ isSelected }) => (
                        <Tabs.Label
                          className="text-sm font-black"
                          style={{ color: isSelected ? AppPalette.primary : AppPalette.foreground }}
                        >
                          {tab.label}
                        </Tabs.Label>
                      )}
                    </Tabs.Trigger>
                  );
                })}
                </Tabs.List>
              </Tabs>
            </Surface>
          )}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

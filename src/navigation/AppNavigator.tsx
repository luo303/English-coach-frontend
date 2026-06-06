import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

const TAB_BAR_HEIGHT = 72;

const tabs: TabItem[] = [
  { key: 'practice', label: '练习', icon: '◎' },
  { key: 'history', label: '复盘', icon: '▤' },
  { key: 'audio', label: '音频', icon: '◌' },
];

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
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated');
  const insets = useSafeAreaInsets();
  const currentScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenario) ?? scenarios[0] ?? null,
    [scenarios, selectedScenario],
  );

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setScenarios([]);
      setSelectedScenario(null);
      return;
    }

    let cancelled = false;
    setScenarioError(null);

    void fetchScenarios(accessToken)
      .then((records) => {
        if (cancelled) {
          return;
        }

        const nextScenarios = records.map(toScenario);
        setScenarios(nextScenarios);
        setSelectedScenario((current) => current ?? nextScenarios[0]?.id ?? null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setScenarioError(error instanceof Error ? error.message : '加载场景失败。');
        setScenarios([]);
        setSelectedScenario(null);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, isAuthenticated]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      {!isAuthenticated ? <LoginScreen /> : null}
      {isAuthenticated ? (
      <View style={styles.shell}>
        <View style={styles.content}>
          {activeTab === 'practice' ? (
            <ScenarioSelectScreen
              error={scenarioError}
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

        <View
          style={[
            styles.tabBar,
            {
              height: TAB_BAR_HEIGHT + insets.bottom,
              paddingBottom: Math.max(insets.bottom, 8),
            },
          ]}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                accessibilityRole="button"
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={styles.tabItem}
              >
                <View style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                  <Text style={[styles.tabIconText, isActive && styles.tabIconTextActive]}>{tab.icon}</Text>
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppPalette.page,
  },
  shell: {
    flex: 1,
    backgroundColor: AppPalette.page,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: AppPalette.line,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: 0,
    paddingHorizontal: 10,
    paddingTop: 9,
    position: 'absolute',
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
  },
  tabIcon: {
    alignItems: 'center',
    backgroundColor: '#EEF1F5',
    borderRadius: 10,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  tabIconActive: {
    backgroundColor: AppPalette.blueSoft,
    borderColor: '#BFD2FF',
    borderWidth: 1,
  },
  tabIconText: {
    color: AppPalette.faint,
    fontSize: 15,
    fontWeight: '900',
  },
  tabIconTextActive: {
    color: AppPalette.blue,
  },
  tabLabel: {
    color: AppPalette.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  tabLabelActive: {
    color: AppPalette.blue,
  },
});

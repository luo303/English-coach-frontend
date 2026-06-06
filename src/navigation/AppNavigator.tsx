import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppPalette } from '@/constants/appPalette';
import { scenarios, tabs } from '@/data/practiceMock';
import { AudioSpikeScreen } from '@/screens/AudioSpikeScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { PracticeScreen } from '@/screens/PracticeScreen';
import { ScenarioSelectScreen } from '@/screens/ScenarioSelectScreen';
import { SessionSummaryScreen } from '@/screens/SessionSummaryScreen';
import { TabKey } from '@/types/practice';

const TAB_BAR_HEIGHT = 72;

export function AppNavigator() {
  const [activeTab, setActiveTab] = useState<TabKey>('practice');
  const [selectedScenario, setSelectedScenario] = useState('meeting');
  const insets = useSafeAreaInsets();
  const currentScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenario) ?? scenarios[0],
    [selectedScenario],
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.content}>
          {activeTab === 'practice' ? (
            <ScenarioSelectScreen
              selectedScenario={selectedScenario}
              onSelectScenario={setSelectedScenario}
              onStart={() => setActiveTab('conversation')}
            />
          ) : null}
          {activeTab === 'conversation' ? (
            <PracticeScreen scenario={currentScenario} onEnd={() => setActiveTab('summary')} />
          ) : null}
          {activeTab === 'summary' ? (
            <SessionSummaryScreen onPracticeAgain={() => setActiveTab('practice')} />
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

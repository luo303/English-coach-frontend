import { Accordion } from 'heroui-native';
import { ScrollView } from 'react-native';

import { DifficultySelector } from '@/components/scenario/DifficultySelector';
import { ScenarioCard } from '@/components/scenario/ScenarioCard';
import { CardSkeletons, EmptyState, ScreenHeader } from '@/components/ui/AppLayout';
import { AppPalette } from '@/constants/appPalette';
import { useErrorToast } from '@/hooks/useErrorToast';
import { Scenario } from '@/types/practice';

type ScenarioSelectScreenProps = {
  error: string | null;
  isLoading: boolean;
  scenarios: Scenario[];
  selectedScenario: string | null;
  onSelectScenario: (id: string) => void;
  onStart: () => void;
};

export function ScenarioSelectScreen({
  error,
  isLoading,
  scenarios,
  selectedScenario,
  onSelectScenario,
  onStart,
}: ScenarioSelectScreenProps) {
  useErrorToast({ message: error, title: '场景加载失败' });

  return (
    <ScrollView
      className="bg-background"
      contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20, paddingTop: 22 }}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: AppPalette.background, flex: 1 }}
    >
      <ScreenHeader title="选择对话场景即可" />

      <DifficultySelector />

      {isLoading && scenarios.length === 0 ? (
        <>
          <EmptyState title="正在加载场景" />
          <CardSkeletons />
        </>
      ) : null}

      <Accordion
        className="mb-1"
        selectionMode="single"
        value={selectedScenario ?? undefined}
        variant="surface"
        onValueChange={(value: string | string[] | undefined) => {
          if (typeof value === 'string') {
            onSelectScenario(value);
          }
        }}
      >
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} onStart={onStart} />
        ))}
      </Accordion>
    </ScrollView>
  );
}

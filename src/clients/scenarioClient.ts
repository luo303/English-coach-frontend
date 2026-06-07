import { apiRequest } from '@/clients/apiClient';
import { PersonaRecord, ScenarioDetailRecord, ScenarioRecord } from '@/types/api';

export function fetchPersonas(token?: string) {
  return apiRequest<PersonaRecord[]>('/api/v1/personas', {
    token,
  });
}

export function fetchScenarios(token?: string) {
  return apiRequest<ScenarioRecord[]>('/api/v1/scenarios', {
    token,
  });
}

export function fetchScenarioDetail(scenarioId: string, token?: string) {
  return apiRequest<ScenarioDetailRecord>(`/api/v1/scenarios/${scenarioId}`, {
    token,
  });
}

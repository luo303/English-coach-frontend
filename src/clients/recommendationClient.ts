import { apiRequest } from '@/clients/apiClient';
import { RecommendationTopic } from '@/types/api';

export function fetchRecommendationTopics(token: string) {
  return apiRequest<RecommendationTopic[]>('/api/v1/recommendations/topics', {
    token,
  });
}

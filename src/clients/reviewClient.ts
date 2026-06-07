import { apiRequest } from '@/clients/apiClient';
import { ReviewMistake, ReviewSentence } from '@/types/api';

type ReviewMistakeFilters = {
  category?: 'grammar' | 'pronunciation' | 'vocabulary' | string;
  status?: 'pending' | 'mastered' | string;
};

export function fetchReviewMistakes(token: string, filters: ReviewMistakeFilters = {}) {
  const search = new URLSearchParams();

  if (filters.category) {
    search.set('category', filters.category);
  }

  if (filters.status) {
    search.set('status', filters.status);
  }

  const query = search.toString();
  return apiRequest<ReviewMistake[]>(`/api/v1/review/mistakes${query ? `?${query}` : ''}`, {
    token,
  });
}

export function fetchReviewSentences(token: string) {
  return apiRequest<ReviewSentence[]>('/api/v1/review/sentences', {
    token,
  });
}

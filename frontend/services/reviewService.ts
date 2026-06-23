import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';

export interface RoomReview {
  review_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  // replies structure if needed
  replies?: Array<{
    id: string;
    authorName: string;
    isHost: boolean;
    content: string;
    createdAt: string;
  }>;
}

export interface ListReviewsResponse {
  items: RoomReview[];
  total: number;
  page: number;
  limit: number;
}

export const reviewService = {
  getRoomReviews: async (
    roomId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<ListReviewsResponse>> => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.limit !== undefined) query.append('limit', String(params.limit));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    
    return apiClient.get<ApiResponse<ListReviewsResponse>>(`/rooms/${roomId}/reviews${queryString}`);
  },

  createReview: async (data: {
    deposit_id: string;
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<{ review: RoomReview }>> => {
    return apiClient.post<ApiResponse<{ review: RoomReview }>>('/reviews', data);
  },
};

// API service for WiseTale backend
// Use Vercel proxy to avoid Mixed Content issues with HTTPS
import { trackEvent } from './analytics';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || '/api';

export interface GenerateRequest {
  subject: string;
  topic: string;
  user_id?: number;
  persona?: string;
  language?: string;
}

export interface GenerateResponse {
  id: string;  // Firebase document ID
  video_url: string;
  audio_url: string;
  transcript: string;
  images_used: string[];
  created_at: string;
  status: 'processing' | 'completed' | 'failed';
}

export interface GenerationStatus {
  id: string;
  status: 'completed' | 'failed';
  url: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Generate video story
  async generateVideo(request: GenerateRequest): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('/v1/generate/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get generation status
  async getGenerationStatus(generationId: string): Promise<GenerationStatus> {
    return this.request<GenerationStatus>(`/v1/generate/status/${generationId}`);
  }

  // Get user's recent generations
  async getUserGenerations(userId: number, limit: number = 10): Promise<any[]> {
    return this.request<any>(`/v1/generate/user/${userId}/recent?limit=${limit}`);
  }

  // Poll generation status with timeout
  async pollGenerationStatus(
    generationId: string,
    onProgress?: (status: GenerationStatus) => void,
    maxAttempts: number = 30,
    interval: number = 2000
  ): Promise<GenerationStatus> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
      const status = await this.getGenerationStatus(generationId);
      
      if (onProgress) {
        onProgress(status);
      }
      
      if (status.status === 'completed' || status.status === 'failed') {
        return status;
        }
      } catch (error) {
        console.warn('Status check failed:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }
    
    throw new Error('Generation timeout - maximum attempts reached');
  }
}

// Export singleton instance
export const apiService = new ApiService(); 
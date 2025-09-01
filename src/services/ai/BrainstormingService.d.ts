export interface BrainstormingIdea {
  id: string;
  title: string;
  angle: string;
  description: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedWordCount: number;
  isFavorited: boolean;
  createdAt: string;
  score: number;
  metadata?: {
    generatedFromTopic: string;
    generationIndex: number;
    fallback?: boolean;
  };
}

export interface GenerateIdeasParams {
  topic: string;
  count?: number;
  vertical?: string;
  tone?: string;
  contentTypes?: string[];
  provider?: string;
  model?: string;
  customContext?: string;
}

export interface GenerateIdeasResult {
  success: boolean;
  ideas: BrainstormingIdea[];
  tokensUsed?: number;
  cost?: number;
  durationMs?: number;
  error?: string;
  metadata?: {
    topic: string;
    count: number;
    vertical: string;
    tone: string;
    contentTypes: string[];
    provider: string;
    model: string;
    generatedAt: string;
  };
}

export interface SaveIdeasResult {
  success: boolean;
  sessionId?: string;
  savedCount?: number;
  error?: string;
}

export interface LoadIdeasResult {
  success: boolean;
  sessionId?: string;
  ideas?: BrainstormingIdea[];
  savedAt?: string;
  favoriteIds?: string[];
  error?: string;
}

export interface BrainstormingSession {
  sessionId: string;
  topic: string;
  ideaCount: number;
  savedAt: string;
  favoriteCount: number;
}

export interface GetSessionsResult {
  success: boolean;
  sessions: BrainstormingSession[];
  error?: string;
}

export interface ToggleFavoriteResult {
  success: boolean;
  isFavorited?: boolean;
  favoriteCount?: number;
  error?: string;
}

export interface ConvertToBlogsResult {
  success: boolean;
  blogRequests: any[];
  convertedCount?: number;
  error?: string;
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  format?: string;
  ideaCount?: number;
  error?: string;
}

export class BrainstormingService {
  generateIdeas(params: GenerateIdeasParams): Promise<GenerateIdeasResult>;
  saveIdeas(ideas: BrainstormingIdea[], sessionId: string): Promise<SaveIdeasResult>;
  loadIdeas(sessionId: string): Promise<LoadIdeasResult>;
  getSavedSessions(): Promise<GetSessionsResult>;
  toggleFavorite(sessionId: string, ideaId: string): Promise<ToggleFavoriteResult>;
  convertIdeasToBlogs(ideaIds: string[], sessionId: string): Promise<ConvertToBlogsResult>;
  exportIdeas(ideas: BrainstormingIdea[], format?: string): Promise<ExportResult>;
}

export const brainstormingService: BrainstormingService;
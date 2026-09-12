export interface LeafAnalysis {
  leaf_id?: string;
  leaf_type?: string;
  type?: string;
  health_condition?: string;
  condition?: string;
  dryness_score?: number;
  dryness?: number;
  vein_density: number;
  pop_potential: number;
  predicted_loudness: number;
  predicted_sharpness: number;
  predicted_duration: number;
  difficulty: string;
  recommendation: string;
  confidence: number;
}

export interface LeafUploadResponse {
  leaf_id: string;
  image_url: string;
  created_at?: string;
}

export interface LeafReportResponse {
  id?: string;
  image_url?: string;
  created_at?: string;
  analysis?: LeafAnalysis | null;
  prediction?: any;
  leaf?: {
    id: string;
    image_url: string;
    created_at?: string;
  };
}

export interface AudioScoreBreakdown {
  loudness: number;
  sharpness: number;
  clarity: number;
  impact: number;
  final_score: number;
  message?: string;
}

export interface AudioPhysicsFeatures {
  audio_duration?: number;
  peak_amplitude?: number;
  rms_energy?: number;
  peak_frequency?: number;
  spectral_centroid?: number;
  attack_time?: number;
  pop_duration?: number;
  noise_level?: number;
  signal_to_noise?: number;
}

export interface PredictionComparison {
  predicted: number;
  actual: number;
  diff: number;
  percentage_error?: number;
}

export interface PopUploadResponse {
  pop_id: string;
  id?: string;
  result?: AudioScoreBreakdown;
  score?: AudioScoreBreakdown;
  final_score: number;
  audio_features?: AudioPhysicsFeatures;
  pop_detected?: boolean;
  message: string;
  prediction_comparison?: PredictionComparison | null;
  ai_engine?: string;
}

export interface VirtualPopRequest {
  click_x: number;
  click_y: number;
  velocity: number;
  duration_ms: number;
  reaction_time_ms: number;
  leaf_id?: string | null;
  combo?: number;
}

export interface VirtualPopResponse {
  attempt_id?: string;
  score: number;
  impact?: number;
  pop_strength?: number;
  rank?: string;
  message: string;
  combo_bonus?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  score: number;
  best_score: number;
  total_pops?: number;
  mode?: 'all' | 'real' | 'virtual';
  source?: 'all' | 'uploaded' | 'recorded' | 'virtual';
  audio_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserStats {
  user_id: string;
  username?: string;
  total_pops?: number;
  highest_pop_score?: number;
  average_pop_score?: number;
  total_virtual_pops?: number;
  highest_virtual_score?: number;
  rank_title?: string;
  best_score?: number;
  average_score?: number;
  rank?: number;
  leaves_analyzed?: number;
}

export interface PopHistoryItem {
  id: string;
  score: number;
  created_at?: string;
  date?: string;
  leaf_name?: string;
  audio_url?: string;
  mode?: string;
  image_url?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  stats?: UserStats;
}

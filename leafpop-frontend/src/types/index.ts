export interface LeafAnalysis {
  leaf_id: string;
  leaf_type: string;
  health_condition: string;
  dryness_score: number;
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
}

export interface LeafReportResponse {
  id: string;
  image_url: string;
  created_at: string;
  analysis: LeafAnalysis | null;
}

export interface AudioScoreBreakdown {
  loudness: number;
  sharpness: number;
  clarity: number;
  impact: number;
  final_score: number;
  message: string;
}

export interface AudioPhysicsFeatures {
  audio_duration?: number;
  peak_amplitude?: number;
  rms_energy?: number;
  peak_frequency?: number;
  attack_time?: number;
  pop_duration?: number;
  noise_level?: number;
  signal_to_noise?: number;
}

export interface PredictionComparison {
  predicted: number;
  actual: number;
  diff: number;
  percentage_error: number;
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
}

export interface VirtualPopRequest {
  click_x: number;
  click_y: number;
  velocity: number;
  duration_ms: number;
  reaction_time_ms: number;
  leaf_id?: string | null;
}

export interface VirtualPopResponse {
  score: number;
  impact: number;
  pop_strength: number;
  message: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  best_score: number;
  total_pops: number;
  mode: 'all' | 'real' | 'virtual';
  updated_at?: string;
}

export interface UserStats {
  user_id: string;
  username: string;
  best_score: number;
  total_pops: number;
  average_score: number;
  rank?: number;
  leaves_analyzed?: number;
}

export interface PopHistoryItem {
  id: string;
  score: number;
  created_at: string;
  audio_url?: string;
  mode?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  stats?: UserStats;
}

export interface ProfileData {
  id: string
  name: string
  bio?: string | null
  avatar_url?: string | null
  time_tokens: number
  reputation: number
  total_time_minutes: number
  created_at?: string
  updated_at?: string
}

export interface ActivityData {
  id: string
  user_id: string
  activity_type: string
  duration_minutes: number
  tokens_earned: number
  created_at: string
}

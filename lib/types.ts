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
export interface AppointmentData {
  id: string
  post_id: string
  from_user_id: string
  to_user_id: string
  scheduled_at: string
  status: string
  created_at: string
}

export interface AvailabilityData {
  id: string
  user_id: string
  start_time: string
  end_time: string
  day_of_week: number
  valid_from: string
  valid_until: string
  created_at: string
}

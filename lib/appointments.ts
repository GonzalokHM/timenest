import { supabase } from './supabase'
import type { AppointmentData, AvailabilityData } from './types'

export async function scheduleAppointment(params: {
  post_id: string
  from_user_id: string
  to_user_id: string
  scheduled_at: string
  meeting_url?: string
  status?: string
}): Promise<AppointmentData | null> {
  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        post_id: params.post_id,
        from_user_id: params.from_user_id,
        to_user_id: params.to_user_id,
        scheduled_at: params.scheduled_at,
        meeting_url: params.meeting_url,
        status: params.status ?? 'scheduled'
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data as AppointmentData
}

export async function fetchAppointments(
  userId: string
): Promise<AppointmentData[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return (data as AppointmentData[]) || []
}

export async function createAvailability(params: {
  user_id: string
  start_time: string
  end_time: string
  day_of_week: number
  valid_from: string
  valid_until: string
}): Promise<AvailabilityData | null> {
  const { data, error } = await supabase
    .from('availabilities')
    .insert([params])
    .select()
    .single()

  if (error) throw error
  return data as AvailabilityData
}

export async function fetchAvailabilities(
  userId: string
): Promise<AvailabilityData[]> {
  const { data, error } = await supabase
    .from('availabilities')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error
  return (data as AvailabilityData[]) || []
}

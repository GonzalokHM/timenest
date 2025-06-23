import { supabase } from './supabase'
import type { AppointmentData } from './types'

export async function scheduleAppointment(params: {
  post_id: string
  from_user_id: string
  to_user_id: string
  scheduled_at: string
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

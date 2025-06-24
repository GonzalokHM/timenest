'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChatDialog } from '@/components/chat-dialog'
import { supabase } from '@/lib/supabase'
import type { AppointmentData } from '@/lib/types'

interface AppointmentsListProps {
  currentUserId: string
  appointments: AppointmentData[]
}

interface AppointmentDetails {
  appointment: AppointmentData
  post?: {
    id: string
    title: string
    description: string
  }
  otherUserId: string
  otherUserName: string
}

export function AppointmentsList({
  currentUserId,
  appointments
}: AppointmentsListProps) {
  const [details, setDetails] = useState<AppointmentDetails[]>([])

  useEffect(() => {
    if (!appointments.length) {
      setDetails([])
      return
    }

    const load = async () => {
      const postIds = Array.from(new Set(appointments.map((a) => a.post_id)))
      const userIds = Array.from(
        new Set(appointments.flatMap((a) => [a.from_user_id, a.to_user_id]))
      )

      const [{ data: posts }, { data: profiles }] = await Promise.all([
        supabase
          .from('marketplace_posts')
          .select('id,title,description')
          .in('id', postIds),
        supabase.from('profiles').select('id,name').in('id', userIds)
      ])

      const postMap = new Map((posts || []).map((p) => [p.id, p]))
      const profileMap = new Map((profiles || []).map((p) => [p.id, p.name]))

      const enriched: AppointmentDetails[] = appointments.map((a) => {
        const otherId =
          a.from_user_id === currentUserId ? a.to_user_id : a.from_user_id
        return {
          appointment: a,
          post: postMap.get(a.post_id),
          otherUserId: otherId,
          otherUserName: profileMap.get(otherId) || 'Usuario'
        }
      })

      setDetails(enriched)
    }

    load()
  }, [appointments, currentUserId])

  if (!details.length) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        No hay citas programadas
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {details.map((item) => (
        <AppointmentCard key={item.appointment.id} data={item} />
      ))}
    </div>
  )
}

interface AppointmentCardProps {
  data: AppointmentDetails
}

function AppointmentCard({ data }: AppointmentCardProps) {
  const { appointment, post, otherUserId, otherUserName } = data
  const [chatOpen, setChatOpen] = useState(false)
  const scheduled = new Date(appointment.scheduled_at)
  const canStart = scheduled.getTime() - Date.now() <= 5 * 60 * 1000

  const handleStart = () => {
    if (appointment.meeting_url) {
      window.location.href = appointment.meeting_url
    }
  }

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle className='text-lg line-clamp-2'>
          {post?.title || 'Cita'}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col space-y-3'>
        <p className='text-sm text-muted-foreground line-clamp-3'>
          {post?.description}
        </p>
        <p className='text-sm'>Con {otherUserName}</p>
        <p className='text-sm text-muted-foreground'>
          {scheduled.toLocaleString('es-ES')}
        </p>
        <div className='mt-auto space-y-2'>
          <Button
            className='w-full'
            variant='outline'
            onClick={() => setChatOpen(true)}
          >
            Chat
          </Button>
          <Button className='w-full' disabled={!canStart} onClick={handleStart}>
            Start
          </Button>
        </div>
      </CardContent>
      <ChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        postId={appointment.post_id}
        recipientId={otherUserId}
        recipientName={otherUserName}
      />
    </Card>
  )
}

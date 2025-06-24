'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import type { AppointmentData } from '@/lib/types'

interface AppointmentCardProps {
  appointment: AppointmentData
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const handleJoin = () => {
    if (appointment.meeting_url) {
      window.open(appointment.meeting_url, '_blank')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pr\u00f3xima cita</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{new Date(appointment.scheduled_at).toLocaleString('es-ES')}</p>
      </CardContent>
      {appointment.meeting_url && (
        <CardFooter>
          <Button onClick={handleJoin}>Unirse a la reuni\u00f3n</Button>
        </CardFooter>
      )}
    </Card>
  )
}

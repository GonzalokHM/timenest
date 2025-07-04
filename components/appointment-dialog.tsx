'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  scheduleAppointment,
  fetchAvailabilities,
  fetchAppointments
} from '@/lib/appointments'
import { useToast } from '@/hooks/use-toast'

interface AppointmentDialogProps {
  userId: string
  postId: string
  recipientId: string
  recipientName: string
}

export function AppointmentDialog({
  userId,
  postId,
  recipientId,
  recipientName
}: AppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [slots, setSlots] = useState<{ label: string; value: string }[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>()
  const [meetingUrl, setMeetingUrl] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadSlots()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const loadSlots = async () => {
    const [avs, appts] = await Promise.all([
      fetchAvailabilities(recipientId),
      fetchAppointments(recipientId)
    ])

    const booked = new Set(appts.map((a) => new Date(a.scheduled_at).getTime()))
    const result: { label: string; value: string }[] = []
    const today = new Date()
    const limit = new Date()
    limit.setMonth(limit.getMonth() + 3)
    for (let d = new Date(today); d <= limit; d.setDate(d.getDate() + 1)) {
      avs.forEach((av) => {
        const startRange = new Date(av.valid_from)
        const endRange = new Date(av.valid_until)
        if (d >= startRange && d <= endRange && d.getDay() === av.day_of_week) {
          const [h, m] = av.start_time.split(':')
          const slot = new Date(d)
          slot.setHours(parseInt(h), parseInt(m), 0, 0)
          if (!booked.has(slot.getTime())) {
            result.push({
              label: slot.toLocaleString('es-ES'),
              value: slot.toISOString()
            })
          }
        }
      })
    }
    result.sort(
      (a, b) => new Date(a.value).getTime() - new Date(b.value).getTime()
    )
    setSlots(result)
    setSelectedSlot(result[0]?.value)
  }
  const handleConfirm = async () => {
    if (!selectedSlot) return
    const isoSlot = new Date(selectedSlot).toISOString()
    let url = meetingUrl
    if (!url) {
      const res = await fetch('/api/zoom/create-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          topic: `Cita con ${recipientName}`,
          start_time: isoSlot
        })
      })
      if (res.ok) {
        const data = await res.json()
        url = data.join_url
      }
    }
    await scheduleAppointment({
      post_id: postId,
      from_user_id: userId,
      to_user_id: recipientId,
      scheduled_at: isoSlot,
      meeting_url: url || undefined
    })
    toast({ title: 'Cita agendada', description: '...' })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Agendar cita</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>Agendar cita</DialogTitle>
          <DialogDescription>
            Selecciona la fecha y hora para la cita
          </DialogDescription>
        </DialogHeader>
        {slots.length === 0 ? (
          <p>No hay horarios disponibles</p>
        ) : (
          <Select value={selectedSlot} onValueChange={setSelectedSlot}>
            <SelectTrigger>
              <SelectValue placeholder='Selecciona horario' />
            </SelectTrigger>
            <SelectContent>
              {slots.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Input
          className='mt-4'
          placeholder='Enlace de la reunión (opcional)'
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
        />
        <DialogFooter className='flex justify-end'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedSlot}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

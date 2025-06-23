'use client'

import { useState } from 'react'
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
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { scheduleAppointment } from '@/lib/appointments'

interface AppointmentDialogProps {
  userId: string
  postId: string
}

export function AppointmentDialog({ userId, postId }: AppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const handleConfirm = async () => {
    if (!selectedDate) return
    await scheduleAppointment(userId, postId, selectedDate)
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
          />
        </LocalizationProvider>
        <DialogFooter className='flex justify-end'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

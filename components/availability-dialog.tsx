'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { createAvailability } from '@/lib/appointments'
import { addMonths, format } from 'date-fns'

interface AvailabilityDialogProps {
  userId: string
}

export function AvailabilityDialog({ userId }: AvailabilityDialogProps) {
  const [open, setOpen] = useState(false)
  const [start, setStart] = useState('17:00')
  const [end, setEnd] = useState('20:00')
  const [day, setDay] = useState('1') // Monday

  const handleSave = async () => {
    const now = new Date()
    const validFrom = format(now, 'yyyy-MM-dd')
    const validUntil = format(addMonths(now, 3), 'yyyy-MM-dd')
    await createAvailability({
      user_id: userId,
      start_time: start + ':00',
      end_time: end + ':00',
      day_of_week: parseInt(day),
      valid_from: validFrom,
      valid_until: validUntil
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Agregar disponibilidad</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>Nueva disponibilidad</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Día de la semana</label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='0'>Domingo</SelectItem>
                <SelectItem value='1'>Lunes</SelectItem>
                <SelectItem value='2'>Martes</SelectItem>
                <SelectItem value='3'>Miércoles</SelectItem>
                <SelectItem value='4'>Jueves</SelectItem>
                <SelectItem value='5'>Viernes</SelectItem>
                <SelectItem value='6'>Sábado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Hora inicio</label>
            <Input
              type='time'
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Hora fin</label>
            <Input
              type='time'
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className='flex justify-end'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

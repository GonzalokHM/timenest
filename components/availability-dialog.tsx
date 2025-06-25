'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { createAvailability } from '@/lib/appointments'
import { addMonths, format } from 'date-fns'
interface AvailabilityDialogProps {
  userId: string
  onCreated?: () => void
}

const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
]

export function AvailabilityDialog({
  userId,
  onCreated
}: AvailabilityDialogProps) {
  const [open, setOpen] = useState(false)
  const [start, setStart] = useState('17:00')
  const [end, setEnd] = useState('20:00')
  const [days, setDays] = useState<number[]>([])
  const today = format(new Date(), 'yyyy-MM-dd')
  const threeMonths = format(addMonths(new Date(), 3), 'yyyy-MM-dd')
  const [validFrom, setValidFrom] = useState(today)
  const [validUntil, setValidUntil] = useState(threeMonths)

  const handleSave = async () => {
    if (days.length === 0) return
    await Promise.all(
      days.map((d) =>
        createAvailability({
          user_id: userId,
          start_time: start + ':00',
          end_time: end + ':00',
          day_of_week: d,
          valid_from: validFrom,
          valid_until: validUntil
        })
      )
    )
    onCreated?.()
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
          <DialogDescription>elige disponibilidad</DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Días de la semana</label>
            <div className='grid grid-cols-2 gap-2'>
              {DAY_NAMES.map((name, idx) => (
                <label
                  key={idx}
                  className='flex items-center space-x-2 text-sm'
                >
                  <Checkbox
                    checked={days.includes(idx)}
                    onCheckedChange={(checked: boolean) => {
                      setDays((prev) =>
                        checked ? [...prev, idx] : prev.filter((d) => d !== idx)
                      )
                    }}
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
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
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Válido desde</label>
            <Input
              type='date'
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Válido hasta</label>
            <Input
              type='date'
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
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

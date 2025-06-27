'use client'

import { useEffect, useState } from 'react'
import { fetchAvailabilities, deleteAvailability } from '@/lib/appointments'
import type { AvailabilityData } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Clock, Trash } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AvailabilityListProps {
  userId: string
  refresh?: number
}

const DAYS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
]

export function AvailabilityList({ userId, refresh }: AvailabilityListProps) {
  const [loading, setLoading] = useState(true)
  const [availabilities, setAvailabilities] = useState<AvailabilityData[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadAvailabilities()
  }, [userId, refresh])

  const loadAvailabilities = async () => {
    const data = await fetchAvailabilities(userId)
    setAvailabilities(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAvailability(id)
      setAvailabilities((prev) => prev.filter((a) => a.id !== id))
      toast({ title: 'Disponibilidad eliminada' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la disponibilidad',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-4'>
        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (availabilities.length === 0) {
    return (
      <div className='text-center py-4 text-muted-foreground'>
        <Clock className='h-8 w-8 mx-auto mb-2 opacity-50' />
        <p>No hay horarios registrados</p>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {availabilities.map((av) => (
        <div
          key={av.id}
          className='flex items-center justify-between p-2 border rounded'
        >
          <div className='text-sm'>
            <p>
              {DAYS[av.day_of_week]} {av.start_time.slice(0, 5)}-
              {av.end_time.slice(0, 5)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {av.valid_from} - {av.valid_until}
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge variant='secondary'>
              {DAYS[av.day_of_week].slice(0, 3)}
            </Badge>
            <button
              type='button'
              onClick={() => handleDelete(av.id)}
              className='text-red-500 hover:text-red-700'
            >
              <Trash className='h-4 w-4' />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

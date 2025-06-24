'use client'

import { useEffect, useState } from 'react'
import { fetchAvailabilities } from '@/lib/appointments'
import type { AvailabilityData } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

interface AvailabilityListProps {
  userId: string
  refresh?: number
}

const DAYS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Mi\u00e9rcoles',
  'Jueves',
  'Viernes',
  'S\u00e1bado'
]

export function AvailabilityList({ userId, refresh }: AvailabilityListProps) {
  const [loading, setLoading] = useState(true)
  const [availabilities, setAvailabilities] = useState<AvailabilityData[]>([])

  useEffect(() => {
    loadAvailabilities()
  }, [userId, refresh])

  const loadAvailabilities = async () => {
    const data = await fetchAvailabilities(userId)
    setAvailabilities(data)
    setLoading(false)
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
          <Badge variant='secondary'>{DAYS[av.day_of_week].slice(0, 3)}</Badge>
        </div>
      ))}
    </div>
  )
}

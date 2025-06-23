'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Timer } from '@/components/timer'
import { Marketplace } from '@/components/marketplace'
import { Profile } from '@/components/profile'
import { supabase } from '@/lib/supabase'
import type { ProfileData } from '@/lib/types'
import {
  Clock,
  Coins,
  Star,
  TrendingUp,
  Users,
  LogOut,
  User,
  Store,
  Activity
} from 'lucide-react'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [weeklyTime, setWeeklyTime] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProfile()
      loadWeeklyTime()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const newProfile = {
        id: user.id,
        name:
          user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
        time_tokens: 0,
        reputation: 5.0,
        total_time_minutes: 0
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (!createError) {
        setProfile(createdProfile)
      }
    } else if (!error) {
      setProfile(data)
    }

    setLoading(false)
  }

  const loadWeeklyTime = async () => {
    if (!user) return

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data } = await supabase
      .from('activities')
      .select('duration_minutes')
      .eq('user_id', user.id)
      .gte('created_at', oneWeekAgo.toISOString())

    if (data) {
      const total = data.reduce(
        (sum, activity) => sum + activity.duration_minutes,
        0
      )
      setWeeklyTime(total)
    }
  }

  const handleTokensUpdate = (newTokens: number) => {
    if (profile) {
      setProfile({ ...profile, time_tokens: newTokens })
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-3'>
              <div className='bg-primary rounded-full p-2'>
                <Clock className='h-6 w-6 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-gray-900'>TimeNest</h1>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2 text-sm text-gray-600'>
                <Coins className='h-4 w-4 text-yellow-500' />
                <span className='font-medium'>
                  {profile?.time_tokens || 0} TimeTokens
                </span>
              </div>
              <Button variant='ghost' size='sm' onClick={signOut}>
                <LogOut className='h-4 w-4 mr-2' />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>TimeTokens</CardTitle>
              <Coins className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {profile?.time_tokens || 0}
              </div>
              <p className='text-xs text-muted-foreground'>
                Tokens disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tiempo Semanal
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {Math.floor(weeklyTime / 60)}h {weeklyTime % 60}m
              </div>
              <p className='text-xs text-muted-foreground'>Esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Reputación</CardTitle>
              <Star className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {profile?.reputation?.toFixed(1) || '5.0'}
              </div>
              <p className='text-xs text-muted-foreground'>
                Calificación promedio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tiempo Total
              </CardTitle>
              <Clock className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {Math.floor((profile?.total_time_minutes || 0) / 60)}h
              </div>
              <p className='text-xs text-muted-foreground'>Tiempo registrado</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue='timer' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='timer' className='flex items-center space-x-2'>
              <Activity className='h-4 w-4' />
              <span>Temporizador</span>
            </TabsTrigger>
            <TabsTrigger
              value='marketplace'
              className='flex items-center space-x-2'
            >
              <Store className='h-4 w-4' />
              <span>Marketplace</span>
            </TabsTrigger>
            <TabsTrigger
              value='profile'
              className='flex items-center space-x-2'
            >
              <User className='h-4 w-4' />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger
              value='community'
              className='flex items-center space-x-2'
            >
              <Users className='h-4 w-4' />
              <span>Comunidad</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='timer'>
            <Timer
              userId={user?.id || ''}
              currentTokens={profile?.time_tokens || 0}
              onTokensUpdate={handleTokensUpdate}
            />
          </TabsContent>

          <TabsContent value='marketplace'>
            <Marketplace
              userId={user?.id || ''}
              userTokens={profile?.time_tokens || 0}
            />
          </TabsContent>

          <TabsContent value='profile'>
            <Profile
              profile={profile}
              onProfileUpdate={(updated) => setProfile(updated)}
            />
          </TabsContent>

          <TabsContent value='community'>
            <Card>
              <CardHeader>
                <CardTitle>Comunidad TimeNest</CardTitle>
                <CardDescription>
                  Conecta con otros usuarios y descubre oportunidades de
                  intercambio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center py-8'>
                  <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <p className='text-muted-foreground'>
                    Funcionalidad de comunidad próximamente...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Clock, Leaf, Users } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }

    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } else {
      toast({
        title: 'Cuenta creada',
        description: 'Revisa tu email para confirmar tu cuenta'
      })
    }

    setLoading(false)
  }

  const handleGoogleSignIn = () => {
    setLoading(true)

    window.location.href = '/auth/login'
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <div className='flex justify-center items-center space-x-2 mb-4'>
            <div className='bg-primary rounded-full p-3'>
              <Clock className='h-8 w-8 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900'>TimeNest</h1>
          </div>
          <p className='text-gray-600'>
            Intercambia tiempo productivo con otros usuarios
          </p>

          {/* Features */}
          <div className='flex justify-center space-x-6 mt-6 text-sm text-gray-500'>
            <div className='flex items-center space-x-1'>
              <Clock className='h-4 w-4' />
              <span>Registra tiempo</span>
            </div>
            <div className='flex items-center space-x-1'>
              <Leaf className='h-4 w-4' />
              <span>Gana tokens</span>
            </div>
            <div className='flex items-center space-x-1'>
              <Users className='h-4 w-4' />
              <span>Intercambia ayuda</span>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido</CardTitle>
            <CardDescription>
              Inicia sesión o crea una cuenta para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='signin' className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='signin'>Iniciar Sesión</TabsTrigger>
                <TabsTrigger value='signup'>Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value='signin' className='space-y-4'>
                <form onSubmit={handleSignIn} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='password'>Contraseña</Label>
                    <Input
                      id='password'
                      type='password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type='submit' className='w-full' disabled={loading}>
                    {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value='signup' className='space-y-4'>
                <form onSubmit={handleSignUp} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Nombre</Label>
                    <Input
                      id='name'
                      type='text'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email-signup'>Email</Label>
                    <Input
                      id='email-signup'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='password-signup'>Contraseña</Label>
                    <Input
                      id='password-signup'
                      type='password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type='submit' className='w-full' disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className='relative my-4'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  O continúa con
                </span>
              </div>
            </div>

            <Button
              variant='outline'
              className='w-full'
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
              </svg>
              Continuar con Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

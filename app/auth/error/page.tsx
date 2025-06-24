'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthCodeError() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4 space-y-6'>
      <h1 className='text-2xl font-bold'>
        Ocurrió un problema al iniciar sesión
      </h1>
      <p className='text-center text-muted-foreground'>
        No se pudo completar la autenticación. Por favor, verifica tu
        configuración de Google y vuelve a intentarlo.
      </p>
      <Button asChild>
        <Link href='/'>Volver al formulario</Link>
      </Button>
    </div>
  )
}

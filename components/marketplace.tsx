'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { AppointmentDialog } from './appointment-dialog'
import { ChatDialog } from '@/components/chat-dialog'
import {
  Plus,
  Clock,
  User,
  Star,
  MessageCircle,
  HandHeart,
  Search,
  Filter
} from 'lucide-react'

interface MarketplaceProps {
  userId: string
  userTokens: number
}

interface MarketplacePost {
  id: string
  user_id: string
  type: 'offer' | 'request'
  title: string
  description: string
  duration_minutes: number
  tokens_required: number
  category: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  profiles: {
    name: string
    reputation: number
  }
}

const CATEGORIES = [
  'Idiomas',
  'Programación',
  'Diseño',
  'Escritura',
  'Matemáticas',
  'Música',
  'Cocina',
  'Fitness',
  'Negocios',
  'Otros'
]

export function Marketplace({ userId, userTokens }: MarketplaceProps) {
  const [posts, setPosts] = useState<MarketplacePost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<MarketplacePost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form states
  const [formType, setFormType] = useState<'offer' | 'request'>('offer')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDuration, setFormDuration] = useState(30)
  const [formTokens, setFormTokens] = useState(1)
  const [formCategory, setFormCategory] = useState('')

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchTerm, selectedCategory])

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('marketplace_posts')
      .select(
        `
        *,
        profiles (
          name,
          reputation
        )
      `
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las publicaciones',
        variant: 'destructive'
      })
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }

  const filterPosts = () => {
    let filtered = posts

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((post) => post.category === selectedCategory)
    }

    setFilteredPosts(filtered)
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formTitle || !formDescription || !formCategory) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive'
      })
      return
    }

    const { error } = await supabase.from('marketplace_posts').insert([
      {
        user_id: userId,
        type: formType,
        title: formTitle,
        description: formDescription,
        duration_minutes: formDuration,
        tokens_required: formTokens,
        category: formCategory,
        status: 'active'
      }
    ])

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear la publicación',
        variant: 'destructive'
      })
    } else {
      toast({
        title: 'Publicación creada',
        description: 'Tu publicación ha sido creada exitosamente'
      })
      setIsCreateDialogOpen(false)
      resetForm()
      loadPosts()
    }
  }

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormDuration(30)
    setFormTokens(1)
    setFormCategory('')
  }

  const offers = filteredPosts.filter((post) => post.type === 'offer')
  const requests = filteredPosts.filter((post) => post.type === 'request')

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold'>Marketplace de Tiempo</h2>
          <p className='text-muted-foreground'>
            Intercambia tiempo y habilidades con otros usuarios
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              Nueva Publicación
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>Crear Nueva Publicación</DialogTitle>
              <DialogDescription>
                Ofrece tu tiempo o solicita ayuda de otros usuarios
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePost} className='space-y-4'>
              <div>
                <Label>Tipo de publicación</Label>
                <Select
                  value={formType}
                  onValueChange={(value: 'offer' | 'request') =>
                    setFormType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='offer'>
                      Ofrezco tiempo para...
                    </SelectItem>
                    <SelectItem value='request'>
                      Necesito ayuda con...
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='title'>Título</Label>
                <Input
                  id='title'
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder='Ej: Ayuda con inglés conversacional'
                  required
                />
              </div>

              <div>
                <Label htmlFor='description'>Descripción</Label>
                <Textarea
                  id='description'
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder='Describe en detalle lo que ofreces o necesitas...'
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='duration'>Duración (minutos)</Label>
                  <Input
                    id='duration'
                    type='number'
                    value={formDuration}
                    onChange={(e) =>
                      setFormDuration(Number.parseInt(e.target.value))
                    }
                    min='15'
                    max='180'
                    step='15'
                  />
                </div>
                <div>
                  <Label htmlFor='tokens'>TimeTokens</Label>
                  <Input
                    id='tokens'
                    type='number'
                    value={formTokens}
                    onChange={(e) =>
                      setFormTokens(Number.parseInt(e.target.value))
                    }
                    min='1'
                    max='10'
                  />
                </div>
              </div>

              <div>
                <Label>Categoría</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona una categoría' />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex justify-end space-x-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type='submit'>Crear Publicación</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar publicaciones...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className='w-full sm:w-[200px]'>
            <Filter className='h-4 w-4 mr-2' />
            <SelectValue placeholder='Categoría' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todas las categorías</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Marketplace Tabs */}
      <Tabs defaultValue='offers' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='offers' className='flex items-center space-x-2'>
            <HandHeart className='h-4 w-4' />
            <span>Ofertas ({offers.length})</span>
          </TabsTrigger>
          <TabsTrigger value='requests' className='flex items-center space-x-2'>
            <Search className='h-4 w-4' />
            <span>Solicitudes ({requests.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='offers'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {offers.length === 0 ? (
              <div className='col-span-full text-center py-8 text-muted-foreground'>
                <HandHeart className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>No hay ofertas disponibles</p>
                <p className='text-sm'>¡Sé el primero en ofrecer tu tiempo!</p>
              </div>
            ) : (
              offers.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  userTokens={userTokens}
                  isOwner={post.user_id === userId}
                  currentUserId={userId}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value='requests'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {requests.length === 0 ? (
              <div className='col-span-full text-center py-8 text-muted-foreground'>
                <Search className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>No hay solicitudes disponibles</p>
                <p className='text-sm'>¡Crea la primera solicitud de ayuda!</p>
              </div>
            ) : (
              requests.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  userTokens={userTokens}
                  isOwner={post.user_id === userId}
                  currentUserId={userId}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface PostCardProps {
  post: MarketplacePost
  userTokens: number
  isOwner: boolean
  currentUserId: string
}

function PostCard({ post, userTokens, isOwner, currentUserId }: PostCardProps) {
  const canAfford =
    post.type === 'offer' ? userTokens >= post.tokens_required : true
  const typeColor =
    post.type === 'offer'
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800'
  const typeText = post.type === 'offer' ? 'Ofrece' : 'Solicita'
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <Badge className={typeColor}>{typeText}</Badge>
          <Badge variant='outline'>{post.category}</Badge>
        </div>
        <CardTitle className='text-lg line-clamp-2'>{post.title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col'>
        <p className='text-sm text-muted-foreground mb-4 line-clamp-3'>
          {post.description}
        </p>

        <div className='space-y-2 mb-4'>
          <div className='flex items-center text-sm text-muted-foreground'>
            <Clock className='h-4 w-4 mr-2' />
            <span>{post.duration_minutes} minutos</span>
          </div>
          <div className='flex items-center text-sm text-muted-foreground'>
            <User className='h-4 w-4 mr-2' />
            <span>{post.profiles.name}</span>
            <div className='flex items-center ml-2'>
              <Star className='h-3 w-3 text-yellow-500 mr-1' />
              <span className='text-xs'>
                {post.profiles.reputation.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className='mt-auto'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center space-x-1'>
              <span className='text-lg font-bold text-primary'>
                {post.tokens_required}
              </span>
              <span className='text-sm text-muted-foreground'>TimeTokens</span>
            </div>
            {!canAfford && !isOwner && (
              <Badge variant='destructive' className='text-xs'>
                Tokens insuficientes
              </Badge>
            )}
          </div>

          <Button
            className='w-full mb-2'
            onClick={() => {
              if (!isOwner) setChatOpen(true)
            }}
            disabled={!canAfford && !isOwner}
            variant={isOwner ? 'outline' : 'default'}
          >
            <MessageCircle className='h-4 w-4 mr-2' />
            {isOwner ? 'Tu publicación' : 'Contactar'}
          </Button>
          {!isOwner && (
            <AppointmentDialog
              userId={currentUserId}
              postId={post.id}
              recipientId={post.user_id}
            />
          )}
          {!isOwner && (
            <ChatDialog
              open={chatOpen}
              onOpenChange={setChatOpen}
              postId={post.id}
              recipientId={post.user_id}
              recipientName={post.profiles.name}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

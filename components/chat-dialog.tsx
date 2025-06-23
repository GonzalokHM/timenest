'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
  recipientId: string
  recipientName: string
}

interface Message {
  id: string
  from_user_id: string
  to_user_id: string
  post_id: string
  content: string
  created_at: string
}

export function ChatDialog({
  open,
  onOpenChange,
  postId,
  recipientId,
  recipientName
}: ChatDialogProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !user) return

    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (data) {
        setMessages(data)
      }
    }

    loadMessages()

    const channel = supabase
      .channel(`messages-post-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          const message = payload.new as Message
          setMessages((prev) => [...prev, message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [open, user, postId])

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    const { error } = await supabase.from('messages').insert({
      from_user_id: user.id,
      to_user_id: recipientId,
      post_id: postId,
      content: newMessage.trim()
    })

    if (!error) {
      setNewMessage('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Chat con {recipientName}</DialogTitle>
          <DialogDescription>
            Comunícate para coordinar la publicación
          </DialogDescription>
        </DialogHeader>

        <div className='h-64 overflow-y-auto space-y-2 px-1'>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.from_user_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-lg px-3 py-2 text-sm max-w-[70%] ${
                  msg.from_user_id === user?.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className='flex items-center space-x-2'
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder='Escribe un mensaje...'
          />
          <Button type='submit'>Enviar</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { ChatDialog } from '@/components/chat-dialog'

interface MessagesDialogProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Conversation {
  post_id: string
  other_user_id: string
  other_user_name: string
  post_title: string
  last_message: string
}

export function MessagesDialog({
  userId,
  open,
  onOpenChange
}: MessagesDialogProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [chatData, setChatData] = useState<Conversation | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const loadConversations = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (!data) return

      const map = new Map<string, Conversation>()
      for (const msg of data) {
        const otherId =
          msg.from_user_id === userId ? msg.to_user_id : msg.from_user_id
        const key = `${msg.post_id}-${otherId}`
        if (!map.has(key)) {
          map.set(key, {
            post_id: msg.post_id,
            other_user_id: otherId,
            other_user_name: '',
            post_title: '',
            last_message: msg.content
          })
        }
      }

      const conversations = Array.from(map.values())

      if (conversations.length) {
        const profileIds = conversations.map((c) => c.other_user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id,name')
          .in('id', profileIds)
        const profileMap = new Map((profiles || []).map((p) => [p.id, p.name]))

        const postIds = conversations.map((c) => c.post_id)
        const { data: posts } = await supabase
          .from('marketplace_posts')
          .select('id,title')
          .in('id', postIds)
        const postMap = new Map((posts || []).map((p) => [p.id, p.title]))

        conversations.forEach((c) => {
          c.other_user_name = profileMap.get(c.other_user_id) || 'Usuario'
          c.post_title = postMap.get(c.post_id) || ''
        })
      }

      setConversations(conversations)
    }

    loadConversations()
  }, [open, userId])

  const handleSelect = (conv: Conversation) => {
    setChatData(conv)
    setChatOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Mensajes</DialogTitle>
            <DialogDescription>Conversaciones recientes</DialogDescription>
          </DialogHeader>
          <div className='space-y-2 max-h-80 overflow-y-auto'>
            {conversations.map((conv) => (
              <Button
                key={conv.post_id + conv.other_user_id}
                variant='outline'
                className='w-full justify-start'
                onClick={() => handleSelect(conv)}
              >
                <div className='text-left'>
                  <div className='font-medium'>{conv.other_user_name}</div>
                  <div className='text-sm text-muted-foreground truncate'>
                    {conv.post_title} - {conv.last_message}
                  </div>
                </div>
              </Button>
            ))}
            {conversations.length === 0 && (
              <p className='text-sm text-muted-foreground'>
                No hay conversaciones
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {chatData && (
        <ChatDialog
          open={chatOpen}
          onOpenChange={(o) => setChatOpen(o)}
          postId={chatData.post_id}
          recipientId={chatData.other_user_id}
          recipientName={chatData.other_user_name}
        />
      )}
    </>
  )
}

"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
import { Star, Clock, Coins, Edit, Save, X } from "lucide-react"

interface ProfileProps {
  profile: any
  onProfileUpdate: (profile: any) => void
}

export function Profile({ profile, onProfileUpdate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(profile?.name || "")
  const [editBio, setEditBio] = useState(profile?.bio || "")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSaveProfile = async () => {
    if (!profile) return

    setLoading(true)

    const { data, error } = await supabase
      .from("profiles")
      .update({
        name: editName,
        bio: editBio,
      })
      .eq("id", profile.id)
      .select()
      .single()

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente",
      })
      onProfileUpdate(data)
      setIsEditing(false)
    }

    setLoading(false)
  }

  const handleCancelEdit = () => {
    setEditName(profile?.name || "")
    setEditBio(profile?.bio || "")
    setIsEditing(false)
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Card */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">{profile.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>

            {!isEditing ? (
              <>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <CardDescription className="text-center">{profile.bio || "Sin biografía"}</CardDescription>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="mt-2">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nombre</Label>
                  <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit-bio">Biografía</Label>
                  <Textarea
                    id="edit-bio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Cuéntanos sobre ti..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSaveProfile} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Stats Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">TimeTokens</span>
              </div>
              <Badge variant="secondary">{profile.time_tokens}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">Reputación</span>
              </div>
              <Badge variant="secondary">{profile.reputation?.toFixed(1)}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Tiempo Total</span>
              </div>
              <Badge variant="secondary">
                {Math.floor((profile.total_time_minutes || 0) / 60)}h {(profile.total_time_minutes || 0) % 60}m
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity History */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Historial de Actividades</CardTitle>
            <CardDescription>Tus sesiones de tiempo productivo completadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityHistory userId={profile.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ActivityHistory({ userId }: { userId: string }) {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  React.useEffect(() => {
    loadActivities()
  }, [userId])

  const loadActivities = async () => {
    const { data } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (data) {
      setActivities(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay actividades registradas</p>
        <p className="text-sm">¡Completa tu primera sesión de tiempo productivo!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium capitalize">{activity.activity_type.replace("_", " ")}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(activity.created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">{activity.duration_minutes} min</p>
            <p className="text-sm text-green-600">+{activity.tokens_earned} tokens</p>
          </div>
        </div>
      ))}
    </div>
  )
}

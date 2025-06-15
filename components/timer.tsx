"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
import { Play, Pause, RotateCcw, BookOpen, Dumbbell, Brain, Heart, Coffee, Laptop } from "lucide-react"

interface TimerProps {
  userId: string
  currentTokens: number
  onTokensUpdate: (tokens: number) => void
}

const ACTIVITIES = [
  { id: "study", name: "Estudio", icon: BookOpen, color: "bg-blue-500" },
  { id: "exercise", name: "Ejercicio", icon: Dumbbell, color: "bg-red-500" },
  { id: "reading", name: "Lectura", icon: BookOpen, color: "bg-green-500" },
  { id: "meditation", name: "Meditación", icon: Heart, color: "bg-purple-500" },
  { id: "work", name: "Trabajo Productivo", icon: Laptop, color: "bg-gray-500" },
  { id: "learning", name: "Aprendizaje", icon: Brain, color: "bg-yellow-500" },
]

const TIMER_DURATIONS = [
  { value: 15, label: "15 minutos" },
  { value: 25, label: "25 minutos (Pomodoro)" },
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "1 hora" },
]

export function Timer({ userId, currentTokens, onTokensUpdate }: TimerProps) {
  const [selectedActivity, setSelectedActivity] = useState("")
  const [duration, setDuration] = useState(25)
  const [timeLeft, setTimeLeft] = useState(duration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    setTimeLeft(duration * 60)
  }, [duration])

  useEffect(() => {
    loadRecentActivities()
  }, [userId])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const loadRecentActivities = async () => {
    const { data } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (data) {
      setRecentActivities(data)
    }
  }

  const handleTimerComplete = async () => {
    setIsRunning(false)
    setIsCompleted(true)

    // Save activity to database
    const { error: activityError } = await supabase.from("activities").insert([
      {
        user_id: userId,
        activity_type: selectedActivity,
        duration_minutes: duration,
        tokens_earned: 1,
      },
    ])

    if (activityError) {
      toast({
        title: "Error",
        description: "No se pudo guardar la actividad",
        variant: "destructive",
      })
      return
    }

    // Update user tokens
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        time_tokens: currentTokens + 1,
        total_time_minutes: supabase.sql`total_time_minutes + ${duration}`,
      })
      .eq("id", userId)

    if (profileError) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los tokens",
        variant: "destructive",
      })
      return
    }

    onTokensUpdate(currentTokens + 1)
    loadRecentActivities()

    toast({
      title: "¡Sesión completada!",
      description: `Has ganado 1 TimeToken por completar ${duration} minutos de ${ACTIVITIES.find((a) => a.id === selectedActivity)?.name}`,
    })

    // Play completion sound (optional)
    if (typeof Audio !== "undefined") {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
      )
      audio.play().catch(() => {}) // Ignore errors if audio can't play
    }
  }

  const startTimer = () => {
    if (!selectedActivity) {
      toast({
        title: "Selecciona una actividad",
        description: "Debes elegir qué actividad vas a realizar",
        variant: "destructive",
      })
      return
    }
    setIsRunning(true)
    setIsCompleted(false)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(duration * 60)
    setIsCompleted(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100

  const selectedActivityData = ACTIVITIES.find((a) => a.id === selectedActivity)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Timer Card */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="bg-primary rounded-full p-2">
                <Play className="h-5 w-5 text-white" />
              </div>
              <span>Temporizador de Actividad</span>
            </CardTitle>
            <CardDescription>Registra tiempo productivo y gana TimeTokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Activity Selection */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Actividad</label>
                <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITIES.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        <div className="flex items-center space-x-2">
                          <activity.icon className="h-4 w-4" />
                          <span>{activity.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Duración</label>
                <Select value={duration.toString()} onValueChange={(value) => setDuration(Number.parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMER_DURATIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="text-6xl font-mono font-bold text-primary">{formatTime(timeLeft)}</div>
                {selectedActivityData && (
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${selectedActivityData.color}`} />
                    <span className="text-sm text-muted-foreground">{selectedActivityData.name}</span>
                  </div>
                )}
              </div>

              <Progress value={progress} className="w-full h-2" />

              <div className="flex justify-center space-x-2">
                {!isRunning ? (
                  <Button onClick={startTimer} size="lg" className="px-8">
                    <Play className="h-5 w-5 mr-2" />
                    Iniciar
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} variant="secondary" size="lg" className="px-8">
                    <Pause className="h-5 w-5 mr-2" />
                    Pausar
                  </Button>
                )}

                <Button onClick={resetTimer} variant="outline" size="lg">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reiniciar
                </Button>
              </div>

              {isCompleted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium">¡Sesión completada! +1 TimeToken</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actividades Recientes</CardTitle>
            <CardDescription>Tus últimas sesiones completadas</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coffee className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay actividades aún</p>
                <p className="text-xs">¡Completa tu primera sesión!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => {
                  const activityData = ACTIVITIES.find((a) => a.id === activity.activity_type)
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {activityData && (
                          <div
                            className={`w-8 h-8 rounded-full ${activityData.color} flex items-center justify-center`}
                          >
                            <activityData.icon className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{activityData?.name || activity.activity_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {activity.duration_minutes}min
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">+{activity.tokens_earned} token</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

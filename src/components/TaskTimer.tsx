'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Square, Clock } from 'lucide-react'

interface TaskTimerProps {
  taskId: string
  initialTime?: number // em segundos
  onTimeUpdate?: (time: number) => void
}

export default function TaskTimer({ taskId, initialTime = 0, onTimeUpdate }: TaskTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(initialTime)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1
          onTimeUpdate?.(newTime)
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, onTimeUpdate])

  const startTimer = () => {
    setIsRunning(true)
    setStartTime(Date.now())
  }

  const pauseTimer = () => {
    setIsRunning(false)
    setStartTime(null)
  }

  const stopTimer = () => {
    setIsRunning(false)
    setStartTime(null)
    setTime(0)
    onTimeUpdate?.(0)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg px-3 py-1">
        <Clock className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-mono text-gray-900">{formatTime(time)}</span>
      </div>
      
      <div className="flex items-center space-x-1">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="p-1 hover:bg-green-100 rounded text-green-600"
            title="Iniciar timer"
          >
            <Play className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="p-1 hover:bg-yellow-100 rounded text-yellow-600"
            title="Pausar timer"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={stopTimer}
          className="p-1 hover:bg-red-100 rounded text-red-600"
          title="Parar timer"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
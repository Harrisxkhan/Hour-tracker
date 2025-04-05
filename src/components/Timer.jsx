import { useState, useEffect, useRef } from 'react'

function Timer({ onTimeUpdate, canStart = true, isGoalCompleted = false, currentGoal = 0 }) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [displayedGoal, setDisplayedGoal] = useState(currentGoal)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(0)
  
  // Update displayed goal whenever currentGoal changes
  useEffect(() => {
    setDisplayedGoal(currentGoal)
  }, [currentGoal])
  
  // Load saved time from localStorage
  useEffect(() => {
    const savedTime = localStorage.getItem('workTracker_timer')
    if (savedTime) {
      setElapsedTime(parseInt(savedTime, 10))
    }
  }, [])
  
  // Save time to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('workTracker_timer', elapsedTime.toString())
    
    // Update parent component with elapsed time
    const shouldStop = onTimeUpdate(elapsedTime)
    
    // If goal is completed, stop the timer automatically
    if (shouldStop && isRunning) {
      pauseTimer()
    }
  }, [elapsedTime, onTimeUpdate, isRunning])
  
  // Stop timer when goal is completed
  useEffect(() => {
    if (isGoalCompleted && isRunning) {
      pauseTimer()
    }
  }, [isGoalCompleted])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':')
  }

  const formatGoal = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60
    
    if (remainingMins === 0) {
      return hours === 1 ? `1 hour` : `${hours} hours`
    }
    
    return hours === 1 
      ? `1 hour and ${remainingMins} minutes` 
      : `${hours} hours and ${remainingMins} minutes`
  }

  const startTimer = () => {
    if (!isRunning && canStart) {
      setIsRunning(true)
      startTimeRef.current = Date.now() - (elapsedTime * 1000)
      
      // Immediate update to ensure graph starts moving right away
      onTimeUpdate(elapsedTime)
      
      // Use a shorter interval for smoother updates
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsedTime(elapsed)
      }, 500)
    }
  }

  const pauseTimer = () => {
    if (isRunning) {
      clearInterval(intervalRef.current)
      setIsRunning(false)
      
      // Make sure we update one last time on pause
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsedTime(elapsed)
    }
  }

  const resetTimer = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setElapsedTime(0)
    
    // Update with the reset value
    onTimeUpdate(0)
  }

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Work Timer</h2>
      
      {canStart && displayedGoal > 0 && (
        <div className="mb-4 bg-blue-50 p-3 rounded-md border border-blue-100 text-center">
          <p className="text-blue-700 font-medium">
            Your goal is {formatGoal(displayedGoal)}. Let's go!
          </p>
        </div>
      )}
      
      <div className="flex flex-col items-center mb-6">
        <div className="font-mono text-6xl font-bold text-gray-800 mb-8">
          {formatTime(elapsedTime)}
        </div>
        
        <div className="flex space-x-4">
          {!isRunning ? (
            <button
              onClick={startTimer}
              disabled={!canStart || isGoalCompleted}
              className={`px-8 py-3 text-lg font-medium rounded-md shadow-sm transition ${
                canStart && !isGoalCompleted
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white text-lg font-medium rounded-md shadow-sm transition"
            >
              Pause
            </button>
          )}
          
          <button
            onClick={resetTimer}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-lg font-medium rounded-md shadow-sm transition"
          >
            Reset
          </button>
        </div>
        
        {!canStart && (
          <p className="mt-4 text-orange-600 text-center">
            Please set your goal before starting the timer.
          </p>
        )}
      </div>
    </div>
  )
}

export default Timer 
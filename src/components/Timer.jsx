import { useState, useEffect, useRef, useCallback } from 'react'

function Timer({ onTimeUpdate, canStart = true, isGoalCompleted = false, currentGoal = 0, onTimerStateChange = () => {} }) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [displayedGoal, setDisplayedGoal] = useState(currentGoal)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(0)
  const onTimeUpdateRef = useRef(onTimeUpdate)
  const onTimerStateChangeRef = useRef(onTimerStateChange)
  const lastUpdateRef = useRef(0)
  
  // Update the refs when callbacks change
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate
    onTimerStateChangeRef.current = onTimerStateChange
  }, [onTimeUpdate, onTimerStateChange])
  
  // Update displayed goal whenever currentGoal changes
  useEffect(() => {
    setDisplayedGoal(currentGoal)
  }, [currentGoal])
  
  // Load saved time from localStorage (only on mount)
  useEffect(() => {
    const savedTime = localStorage.getItem('workTracker_timer')
    if (savedTime) {
      const parsedTime = parseInt(savedTime, 10)
      setElapsedTime(parsedTime)
      
      // Only run once on initial mount using the current ref
      const savedTimeValue = parsedTime || 0
      onTimeUpdateRef.current(savedTimeValue)
    }
  }, []) // Empty dependency array - only run on mount
  
  // Save time to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('workTracker_timer', elapsedTime.toString())
    
    // Calculate minutes including seconds as a decimal part (for more accurate progress)
    const elapsedMinutes = elapsedTime / 60
    
    // Always update when time changes for smooth progress
    onTimeUpdateRef.current(elapsedMinutes)
    
    // If goal is completed, stop the timer automatically
    const goal = currentGoal * 60 // Convert minutes to seconds
    if (elapsedTime >= goal && goal > 0 && isRunning) {
      pauseTimer()
    }
  }, [elapsedTime, isRunning, currentGoal])
  
  // Stop timer when goal is completed
  useEffect(() => {
    if (isGoalCompleted && isRunning) {
      pauseTimer()
    }
  }, [isGoalCompleted, isRunning])

  // Update parent component when isRunning changes
  useEffect(() => {
    onTimerStateChangeRef.current(isRunning);
  }, [isRunning]);

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
      // Set running state first to enable transitions immediately
      setIsRunning(true)
      
      // Force the timer state update callback immediately
      onTimerStateChangeRef.current(true);
      
      // Calculate starting point for timer
      startTimeRef.current = Date.now() - (elapsedTime * 1000)
      
      // Calculate current elapsed time in minutes (with decimal part for seconds)
      const currentElapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const currentElapsedMinutes = currentElapsedSeconds / 60
      
      // Force immediate update with decimal minutes for the progress bar
      onTimeUpdateRef.current(currentElapsedMinutes)
      
      // Immediately trigger an update of elapsed time to ensure immediate UI update
      setElapsedTime(currentElapsedSeconds)
      
      // Use a shorter interval for better responsiveness - 100ms for smoother updates
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsedTime(elapsed)
      }, 100)
    }
  }

  const pauseTimer = () => {
    if (isRunning) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      
      // Make sure we update one last time on pause
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsedTime(elapsed)
      
      // Force the update to parent with decimal minutes
      const elapsedMinutes = elapsed / 60
      onTimeUpdateRef.current(elapsedMinutes)
      
      // Set running state to false after updates
      setIsRunning(false)
    }
  }

  const resetTimer = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
    setElapsedTime(0)
    lastUpdateRef.current = 0
    
    // Update with the reset value using the ref
    onTimeUpdateRef.current(0)
  }

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Work Timer</h2>
      
      {canStart && displayedGoal > 0 && (
        <div className="mb-4 bg-blue-50 p-4 rounded-md border border-blue-100 text-center">
          <p className="text-blue-700 font-medium">
            Your goal is {formatGoal(displayedGoal)}. Let's go!
          </p>
        </div>
      )}
      
      <div className="flex flex-col items-center mb-6">
        <div className="font-mono text-7xl font-bold text-gray-800 mb-8 animate-pulse-slow">
          {formatTime(elapsedTime)}
        </div>
        
        <div className="flex space-x-4">
          {!isRunning ? (
            <button
              onClick={startTimer}
              disabled={!canStart || isGoalCompleted}
              className={`px-10 py-4 text-xl font-medium rounded-md shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
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
              className="px-10 py-4 bg-yellow-600 hover:bg-yellow-700 text-white text-xl font-medium rounded-md shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              Pause
            </button>
          )}
          
          <button
            onClick={resetTimer}
            className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-medium rounded-md shadow-lg transition-all transform hover:scale-105 active:scale-95"
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
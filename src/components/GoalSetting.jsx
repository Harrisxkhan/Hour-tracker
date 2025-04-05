import { useState, useEffect, useRef } from 'react'

function GoalSetting({ currentGoal, onGoalUpdate, currentProgress, isGoalSet, isTimerRunning = false }) {
  const [goal, setGoal] = useState(currentGoal)
  const [displayProgress, setDisplayProgress] = useState(currentProgress)
  const progressRef = useRef(currentProgress)
  
  // Update local state when prop changes
  useEffect(() => {
    setGoal(currentGoal)
  }, [currentGoal])
  
  // Update the display progress when currentProgress changes
  useEffect(() => {
    progressRef.current = currentProgress
    // Update the display progress immediately without delay
    setDisplayProgress(currentProgress)
  }, [currentProgress])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (goal > 0) {
      onGoalUpdate(goal)
    }
  }
  
  // Calculate progress percentage - include seconds by using decimal minutes instead of rounded
  const progressPercent = currentGoal > 0 
    ? Math.min(Math.round((currentProgress / currentGoal) * 100), 100)
    : 0
    
  const formatHoursMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    const secs = Math.floor((minutes % 1) * 60)
    
    if (hours === 0 && mins === 0) {
      return `${secs}s`
    } else if (hours === 0) {
      return `${mins}m ${secs}s`
    } else {
      return `${hours}h ${mins}m ${secs}s`
    }
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Set Your Work Goal</h2>
      
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              Set your work goal in minutes (hourly, daily, or any time period)
            </label>
            
            <div className="flex">
              <input
                type="number"
                id="goal"
                min="1"
                value={goal}
                onChange={(e) => setGoal(parseInt(e.target.value, 10) || 0)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter minutes"
              />
              
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-r-lg shadow-sm transition-all transform hover:scale-105 active:scale-95"
              >
                {isGoalSet ? 'Update Goal' : 'Set Goal'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setGoal(30)} // 30 minutes
              className="px-2 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm rounded-lg shadow-sm transition-all transform hover:scale-105 active:scale-95 hover:border-blue-400"
            >
              30 min
            </button>
            
            <button
              type="button"
              onClick={() => setGoal(60)} // 1 hour
              className="px-2 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm rounded-lg shadow-sm transition-all transform hover:scale-105 active:scale-95 hover:border-blue-400"
            >
              1 hour
            </button>
            
            <button
              type="button"
              onClick={() => setGoal(4 * 60)} // 4 hours
              className="px-2 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm rounded-lg shadow-sm transition-all transform hover:scale-105 active:scale-95 hover:border-blue-400"
            >
              4 hours
            </button>
            
            <button
              type="button"
              onClick={() => setGoal(8 * 60)} // 8 hours
              className="px-2 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm rounded-lg shadow-sm transition-all transform hover:scale-105 active:scale-95 hover:border-blue-400"
            >
              8 hours
            </button>
          </div>
        </form>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Goal Progress</h3>
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span className="font-medium text-lg">Progress: {formatHoursMinutes(currentProgress)} / {formatHoursMinutes(currentGoal)}</span>
          <span className="font-medium text-lg">{progressPercent}%</span>
        </div>
        
        <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full rounded-full flex items-center justify-end pr-3 text-sm text-white font-medium ${
              progressPercent >= 100 
                ? 'bg-gradient-to-r from-green-500 to-green-400 animate-pulse' 
                : `bg-gradient-to-r from-blue-600 to-blue-400 ${isTimerRunning ? 'progress-bar-animated' : ''}`
            }`}
            style={{ 
              width: `${progressPercent}%`,
              transition: isTimerRunning ? 'width 0.1s linear' : 'none'
            }}
          >
            {progressPercent > 8 ? `${progressPercent}%` : ''}
          </div>
        </div>
        
        {progressPercent > 0 && progressPercent < 100 && (
          <p className="mt-2 text-sm text-gray-600 animate-fadeIn">
            Keep going! You're making great progress.
          </p>
        )}
        
        {progressPercent >= 100 && (
          <p className="mt-2 text-sm text-green-600 animate-fadeIn">
            Great job completing your goal today!
          </p>
        )}
      </div>
    </div>
  )
}

export default GoalSetting 
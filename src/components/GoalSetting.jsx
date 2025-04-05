import { useState, useEffect } from 'react'

function GoalSetting({ currentGoal, onGoalUpdate, currentProgress, isGoalSet }) {
  const [goal, setGoal] = useState(currentGoal)
  
  // Update local state when prop changes
  useEffect(() => {
    setGoal(currentGoal)
  }, [currentGoal])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (goal > 0) {
      onGoalUpdate(goal)
    }
  }
  
  // Calculate progress percentage
  const progressPercent = currentGoal > 0 
    ? Math.min(Math.round((currentProgress / currentGoal) * 100), 100)
    : 0
    
  const formatHoursMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    return `${hours}h ${mins}m`
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Set Your Work Goal</h2>
      
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
              Set your work goal in minutes (hourly, daily, or any time period)
            </label>
            
            <div className="flex">
              <input
                type="number"
                id="goal"
                min="1"
                value={goal}
                onChange={(e) => setGoal(parseInt(e.target.value, 10) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter minutes"
              />
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-r-md shadow-sm transition"
              >
                {isGoalSet ? 'Update Goal' : 'Set Goal'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setGoal(30)} // 30 minutes
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded shadow-sm transition"
            >
              30 min
            </button>
            
            <button
              type="button"
              onClick={() => setGoal(60)} // 1 hour
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded shadow-sm transition"
            >
              1 hour
            </button>
            
            <button
              type="button"
              onClick={() => setGoal(4 * 60)} // 4 hours
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded shadow-sm transition"
            >
              4 hours
            </button>
            
            <button
              type="button"
              onClick={() => setGoal(8 * 60)} // 8 hours
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded shadow-sm transition"
            >
              8 hours
            </button>
          </div>
        </form>
        
        <h3 className="text-lg font-medium text-gray-800 mb-2">Goal Progress</h3>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">Progress: {formatHoursMinutes(currentProgress)} / {formatHoursMinutes(currentGoal)}</span>
          <span className="font-medium">{progressPercent}%</span>
        </div>
        
        <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-xs text-white font-medium ${
              progressPercent >= 100 ? 'bg-green-500' : 'bg-blue-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          >
            {progressPercent > 15 ? `${progressPercent}%` : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoalSetting 
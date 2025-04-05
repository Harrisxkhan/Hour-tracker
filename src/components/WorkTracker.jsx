import { useState, useEffect, useRef } from 'react'
import Timer from './Timer'
import GoalSetting from './GoalSetting'
import TechInsights from './TechInsights'
import WeeklyProgress from './WeeklyProgress'

function WorkTracker({ user }) {
  // Get today's date
  const today = new Date()
  const dayKey = today.toISOString().split('T')[0]
  
  // Initialize state from localStorage or with defaults
  const [workData, setWorkData] = useState(() => {
    const savedData = localStorage.getItem('workTracker_data')
    return savedData ? JSON.parse(savedData) : {
      // Default structure with days
      dailyGoals: {},
      dailyProgress: {}
    }
  })

  // Track if goal is set and completed
  const [isGoalSet, setIsGoalSet] = useState(false)
  const [isGoalCompleted, setIsGoalCompleted] = useState(false)
  const [canStartTimer, setCanStartTimer] = useState(false)
  const [currentGoal, setCurrentGoal] = useState(0)

  // Set default goal for today if not set
  useEffect(() => {
    if (!workData.dailyGoals[dayKey]) {
      setWorkData(prev => ({
        ...prev,
        dailyGoals: {
          ...prev.dailyGoals,
          [dayKey]: 8 * 60 // Default: 8 hours in minutes
        }
      }))
    } else {
      // Goal exists, check if it's been explicitly set
      setIsGoalSet(true)
      setCurrentGoal(workData.dailyGoals[dayKey])
      
      // Check if the goal is already completed
      const progress = workData.dailyProgress[dayKey] || 0
      const goal = workData.dailyGoals[dayKey] || 0
      setIsGoalCompleted(progress >= goal && goal > 0)
    }
    
    // Initialize progress for today if not set
    if (!workData.dailyProgress[dayKey]) {
      setWorkData(prev => ({
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          [dayKey]: 0
        }
      }))
    }
  }, [dayKey, workData.dailyGoals, workData.dailyProgress])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('workTracker_data', JSON.stringify(workData))
  }, [workData])

  // Update progress from timer
  const handleTimeUpdate = (elapsedSeconds) => {
    const elapsedMinutes = elapsedSeconds / 60 // Convert seconds to minutes
    
    setWorkData(prev => ({
      ...prev,
      dailyProgress: {
        ...prev.dailyProgress,
        [dayKey]: elapsedMinutes
      }
    }))
    
    // Check if goal is completed
    const goal = workData.dailyGoals[dayKey] || 0
    if (elapsedMinutes >= goal && goal > 0 && !isGoalCompleted) {
      setIsGoalCompleted(true)
      return true // Return true to signal timer to stop
    }
    return false
  }

  // Update daily goal
  const handleGoalUpdate = (goalMinutes) => {
    // Update the goal in workData
    setWorkData(prev => ({
      ...prev,
      dailyGoals: {
        ...prev.dailyGoals,
        [dayKey]: goalMinutes
      }
    }))
    
    // Update the current goal state directly
    setCurrentGoal(goalMinutes)
    setIsGoalSet(true)
    setCanStartTimer(true)
    
    // If the current progress already exceeds the new goal
    const currentProgress = workData.dailyProgress[dayKey] || 0
    if (currentProgress >= goalMinutes && goalMinutes > 0) {
      setIsGoalCompleted(true)
    } else {
      setIsGoalCompleted(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user.name}!
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              {isGoalCompleted && (
                <div className="mb-6 bg-green-100 p-4 rounded-md border border-green-300">
                  <h3 className="text-lg font-medium text-green-800">Congratulations!</h3>
                  <p className="text-green-700">
                    You've completed your goal. Keep pushing yourself for even greater achievements!
                  </p>
                </div>
              )}
              
              <div className="mb-8">
                <GoalSetting 
                  currentGoal={workData.dailyGoals[dayKey] || 0}
                  onGoalUpdate={handleGoalUpdate}
                  currentProgress={workData.dailyProgress[dayKey] || 0}
                  isGoalSet={isGoalSet}
                />
              </div>
              
              <div>
                <Timer 
                  onTimeUpdate={handleTimeUpdate} 
                  canStart={canStartTimer} 
                  isGoalCompleted={isGoalCompleted}
                  currentGoal={currentGoal}
                  key={currentGoal} // Force re-render when goal changes
                />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <WeeklyProgress 
                workData={workData}
                currentDate={today}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow h-[400px] flex flex-col">
              <TechInsights />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkTracker 
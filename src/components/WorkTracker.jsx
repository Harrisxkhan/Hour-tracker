import { useState, useEffect, useRef, useCallback } from 'react'
import Timer from './Timer'
import GoalSetting from './GoalSetting'
import TechInsights from './TechInsights'
import WeeklyProgress from './WeeklyProgress'
import MotivationQuote from './MotivationQuote'

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
  
  // Add a dedicated progress state to avoid depending solely on workData
  const [currentProgress, setCurrentProgress] = useState(0)
  
  // Add a state to track if timer is running - this will help with animations
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  
  // Add a refresh key to force component updates - using a ref for interval
  const [refreshKey, setRefreshKey] = useState(0)
  const refreshIntervalRef = useRef(null)
  
  // Set up a single interval for refreshing at component mount
  useEffect(() => {
    // Use a refresh rate of 200ms for more responsive UI
    refreshIntervalRef.current = setInterval(() => {
      setRefreshKey(prev => prev + 1)
    }, 200)
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }
  }, []) // Empty dependency - only run once on mount

  // Set default goal for today if not set - using useCallback to stabilize this effect
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
      setCurrentProgress(progress) // Set current progress
      const goal = workData.dailyGoals[dayKey] || 0
      setIsGoalCompleted(progress >= goal && goal > 0)
      setCanStartTimer(true) // Enable timer if goal exists
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
      setCurrentProgress(0) // Reset current progress
    }
  }, [dayKey, workData.dailyGoals, workData.dailyProgress])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('workTracker_data', JSON.stringify(workData))
  }, [workData])

  // Handle timer state change (running/paused)
  const handleTimerStateChange = useCallback((running) => {
    setIsTimerRunning(running);
  }, []);

  // Update progress from timer - wrapped in useCallback to prevent recreation on each render
  const handleTimeUpdate = useCallback((elapsedMinutes) => {
    // Update current progress state directly and immediately for UI updates
    setCurrentProgress(elapsedMinutes)
    
    // Ensure we update workData immediately to keep everything in sync
    setWorkData(prev => {
      const newWorkData = {
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          [dayKey]: elapsedMinutes
        }
      };
      // Return the updated data even for small changes to ensure WeeklyProgress gets updates
      return newWorkData;
    })
    
    // Check if goal is completed using the latest state
    const goal = workData.dailyGoals[dayKey] || 0;
    const shouldComplete = elapsedMinutes >= goal && goal > 0;
    
    if (shouldComplete) {
      setIsGoalCompleted(true);
    }
    
    // Return whether to stop the timer based on current state
    return shouldComplete;
  }, [dayKey, workData.dailyGoals]);

  // Update daily goal - wrapped in useCallback
  const handleGoalUpdate = useCallback((goalMinutes) => {
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
    if (currentProgress >= goalMinutes && goalMinutes > 0) {
      setIsGoalCompleted(true)
    } else {
      setIsGoalCompleted(false)
    }
  }, [dayKey, currentProgress]);
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className={`min-h-screen w-full bg-gradient-to-b from-gray-50 to-blue-50 overflow-x-hidden ${isTimerRunning ? 'timer-running' : ''}`}>
      <div className="w-full px-4 sm:px-6 py-6">
        <div className="flex justify-between items-center mb-6 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {getGreeting()}, {user.name}!
          </h1>
          
          <div className="text-lg text-gray-600 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg transform hover:shadow-xl transition-all duration-300">
              {isGoalCompleted && (
                <div className="mb-6 bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 animate-fadeIn">
                  <h3 className="text-xl font-bold text-green-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Congratulations!
                  </h3>
                  <p className="text-green-700 mt-2">
                    You've completed your goal. Keep pushing yourself for even greater achievements!
                  </p>
                </div>
              )}
              
              <div className="mb-10">
                <GoalSetting 
                  currentGoal={workData.dailyGoals[dayKey] || 0}
                  onGoalUpdate={handleGoalUpdate}
                  currentProgress={currentProgress}
                  isGoalSet={isGoalSet}
                  isTimerRunning={isTimerRunning}
                />
              </div>
              
              <div>
                <Timer 
                  onTimeUpdate={handleTimeUpdate} 
                  canStart={canStartTimer} 
                  isGoalCompleted={isGoalCompleted}
                  currentGoal={currentGoal}
                  onTimerStateChange={handleTimerStateChange}
                />
              </div>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg transform hover:shadow-xl transition-all duration-300">
              <WeeklyProgress 
                workData={{
                  ...workData,
                  dailyProgress: {
                    ...workData.dailyProgress,
                    [dayKey]: currentProgress // Pass the current progress directly
                  }
                }}
                currentDate={today}
                isTimerRunning={isTimerRunning}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg transform hover:shadow-xl transition-all duration-300 flex flex-col h-auto">
              <h2 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                Technical Insights
              </h2>
              <div className="flex-grow overflow-auto">
                <TechInsights />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl shadow-lg text-white h-auto">
              <MotivationQuote isTimerRunning={isTimerRunning} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkTracker 
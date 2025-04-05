import { useMemo, useEffect, useState, useRef } from 'react'

function WeeklyProgress({ workData, currentDate, isTimerRunning = false }) {
  // State to force re-renders on timer updates
  const [refreshKey, setRefreshKey] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const refreshIntervalRef = useRef(null);
  
  // Force refresh less frequently (every 300ms) for better balance
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 300); // Reduced to 300ms for more responsive updates
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []);
  
  // Generate the next 6 days (today + 5 more days) or previous days depending on setting
  const sixDays = useMemo(() => {
    const days = []
    const today = new Date(currentDate)
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(today)
      
      if (showHistory) {
        // For history view: Show today and 5 days in the past
        date.setDate(today.getDate() - 5 + i)
      } else {
        // For future view: Show today and 5 days in the future
        date.setDate(today.getDate() + i)
      }
      
      const dayKey = date.toISOString().split('T')[0]
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      const dayNumber = date.getDate()
      
      // Get values directly from workData (which now includes current progress) - no intermediate state to delay updates
      let progress = workData.dailyProgress[dayKey] || 0
      const goal = workData.dailyGoals[dayKey] || 0
      
      const percentage = goal > 0 ? Math.min(Math.round((progress / goal) * 100), 100) : 0
      
      days.push({
        dayKey,
        dayName,
        dayNumber,
        goal,
        progress,
        percentage,
        isToday: date.toDateString() === today.toDateString()
      })
    }
    
    return days
  }, [currentDate, workData, refreshKey, showHistory]);
  
  // Calculate weekly totals for summary
  const weeklyTotals = useMemo(() => {
    const totalProgress = sixDays.reduce((sum, day) => sum + day.progress, 0);
    const totalGoal = sixDays.reduce((sum, day) => sum + day.goal, 0);
    const averageProgress = totalProgress / sixDays.filter(day => day.progress > 0).length || 0;
    const overallPercentage = totalGoal > 0 ? Math.min(Math.round((totalProgress / totalGoal) * 100), 100) : 0;
    
    return {
      totalProgress,
      totalGoal,
      averageProgress,
      overallPercentage
    };
  }, [sixDays]);
  
  // Format time as hours and minutes
  const formatTime = (minutes) => {
    if (minutes === 0) return '0h'
    
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    const secs = Math.floor((minutes % 1) * 60)
    
    if (hours === 0 && mins === 0) {
      return `${secs}s`
    } else if (hours === 0) {
      return `${mins}m ${secs}s`
    } else if (mins === 0) {
      return `${hours}h`
    } else {
      return `${hours}h ${mins}m`
    }
  }

  // Toggle between history and future view
  const toggleView = () => {
    setShowHistory(prev => !prev);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Weekly Progress</h2>
        <button 
          onClick={toggleView}
          className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm rounded-lg shadow-sm transition-all transform hover:scale-105 active:scale-95 hover:border-blue-400 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {showHistory ? 'Show Future Days' : 'Show Past Days'}
        </button>
      </div>
      
      {/* Weekly Summary */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
        <h3 className="text-lg font-bold text-blue-800 mb-3">Weekly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Total Hours</div>
            <div className="text-xl font-bold text-blue-700">{formatTime(weeklyTotals.totalProgress)}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Weekly Goal</div>
            <div className="text-xl font-bold text-indigo-700">{formatTime(weeklyTotals.totalGoal)}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-xl font-bold text-green-700">{weeklyTotals.overallPercentage}%</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Daily Average</div>
            <div className="text-xl font-bold text-purple-700">{formatTime(weeklyTotals.averageProgress)}</div>
          </div>
        </div>
      </div>
      
      {/* Day-by-Day Breakdown with Progress Bars */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-inner">
        <h3 className="text-xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          {showHistory ? 'Past Days Progress' : 'This Week at a Glance'}
        </h3>
        
        <div className="space-y-5">
          {sixDays.map((day) => (
            <div key={day.dayKey} className="transform transition-all hover:scale-[1.01]">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className={`font-medium text-base ${day.isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {day.dayName} {day.dayNumber}:
                  </span>
                  {day.isToday && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Today</span>
                  )}
                </div>
                <span className="text-gray-700 font-medium">
                  {formatTime(day.progress)} / {formatTime(day.goal)}
                </span>
              </div>
              
              <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`daily-progress-bar ${
                    day.percentage >= 100 
                      ? 'bg-gradient-to-r from-green-600 to-green-400 progress-bar-completed' 
                      : day.isToday && isTimerRunning
                        ? 'bg-gradient-to-r from-blue-600 to-blue-400 progress-bar-animated'
                        : 'bg-gradient-to-r from-blue-500 to-blue-300'
                  }`}
                  style={{ 
                    width: `${day.percentage > 0 ? day.percentage : 0}%`, 
                    transition: (day.isToday && isTimerRunning) ? 'width 0.1s linear' : 'none'
                  }}
                >
                  {day.percentage > 15 ? `${day.percentage}%` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WeeklyProgress 
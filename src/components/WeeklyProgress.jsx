import { useMemo, useEffect, useState } from 'react'

function WeeklyProgress({ workData, currentDate }) {
  // State to force re-renders on timer updates
  const [refreshKey, setRefreshKey] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  
  // Force refresh more frequently (every 500ms) to catch timer updates immediately
  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 500);
    
    return () => clearInterval(intervalId);
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
      
      // Force refresh by getting current values directly from localStorage
      let progress = workData.dailyProgress[dayKey] || 0
      const goal = workData.dailyGoals[dayKey] || 0
      
      // For today, try to get the most up-to-date progress value from localStorage
      if (date.toDateString() === today.toDateString()) {
        try {
          const savedData = localStorage.getItem('workTracker_data')
          if (savedData) {
            const parsedData = JSON.parse(savedData)
            progress = parsedData.dailyProgress[dayKey] || progress
          }
        } catch (e) {
          console.error('Error parsing localStorage data:', e)
        }
      }
      
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
  
  // Format time as hours and minutes
  const formatTime = (minutes) => {
    if (minutes === 0) return '0h'
    
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  // Find the max goal value for scaling the line graph
  const maxGoal = Math.max(...sixDays.map(day => day.goal), 1)
  const maxProgress = Math.max(...sixDays.map(day => day.progress), 1)
  const maxValue = Math.max(maxGoal, maxProgress, 60) // Set minimum scale to 60 minutes

  // Helper function to calculate y-position for the line graph
  const calculateYPosition = (value) => {
    const height = 200; // Line graph height
    return height - (value / maxValue) * height;
  }

  // Create line graph paths
  const goalPoints = sixDays.map((day, index) => {
    const x = index * (100 / 5); // Distribute evenly across 100% width
    const y = calculateYPosition(day.goal);
    return `${x},${y}`;
  }).join(' ');

  const progressPoints = sixDays.map((day, index) => {
    const x = index * (100 / 5); // Distribute evenly across 100% width
    const y = calculateYPosition(day.progress);
    return `${x},${y}`;
  }).join(' ');

  // Toggle between history and future view
  const toggleView = () => {
    setShowHistory(prev => !prev);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Weekly Progress</h2>
        <button 
          onClick={toggleView}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded transition"
        >
          {showHistory ? 'Show Future Days' : 'Show Past Days'}
        </button>
      </div>
      
      <div className="space-y-8">
        {/* Line Graph Visualization */}
        <div className="w-full h-64 bg-white relative">
          <div className="w-full h-full relative border border-gray-200 rounded-lg p-4">
            <svg viewBox="0 0 100 200" className="w-full h-full overflow-visible">
              {/* Grid lines */}
              <line x1="0" y1="0" x2="100" y2="0" stroke="#e5e7eb" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
              <line x1="0" y1="150" x2="100" y2="150" stroke="#e5e7eb" strokeWidth="0.5" />
              <line x1="0" y1="200" x2="100" y2="200" stroke="#e5e7eb" strokeWidth="0.5" />
              
              {/* X-axis ticks for each day */}
              {sixDays.map((day, index) => (
                <line 
                  key={day.dayKey} 
                  x1={index * (100/5)} 
                  y1="200" 
                  x2={index * (100/5)} 
                  y2="205" 
                  stroke="#6b7280" 
                  strokeWidth="0.5" 
                />
              ))}
              
              {/* Goal line (dashed) */}
              <polyline 
                points={goalPoints} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="1.5" 
                strokeDasharray="4"
                className="opacity-70"
              />
              
              {/* Progress line (solid) */}
              <polyline 
                points={progressPoints} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2" 
                className="transition-all duration-200 ease-in-out"
              />
              
              {/* Points for goal */}
              {sixDays.map((day, index) => (
                <circle 
                  key={`goal-${day.dayKey}`}
                  cx={index * (100/5)} 
                  cy={calculateYPosition(day.goal)} 
                  r="1.5" 
                  fill="#3b82f6" 
                />
              ))}
              
              {/* Points for progress */}
              {sixDays.map((day, index) => (
                <circle 
                  key={`progress-${day.dayKey}`}
                  cx={index * (100/5)} 
                  cy={calculateYPosition(day.progress)} 
                  r="2.5" 
                  fill="#10b981" 
                  className="transition-all duration-200 ease-in-out"
                />
              ))}
              
              {/* Y-axis labels */}
              <text x="-5" y="5" fontSize="6" fill="#6b7280" textAnchor="end">{formatTime(maxValue)}</text>
              <text x="-5" y="100" fontSize="6" fill="#6b7280" textAnchor="end">{formatTime(maxValue/2)}</text>
              <text x="-5" y="200" fontSize="6" fill="#6b7280" textAnchor="end">0</text>
            </svg>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 -mb-6">
              {sixDays.map((day) => (
                <div key={day.dayKey} className="text-center">
                  <div className={day.isToday ? "font-semibold" : ""}>{day.dayName}</div>
                  <div>{day.dayNumber}</div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="absolute top-0 right-0 flex space-x-4 text-xs p-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 mr-1 rounded-sm"></div>
                <span>Progress</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 mr-1 rounded-sm"></div>
                <span>Goal</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between space-x-1">
          {sixDays.map((day) => (
            <div 
              key={day.dayKey} 
              className={`flex-1 text-center ${day.isToday ? 'font-semibold' : ''}`}
            >
              <div className="text-sm text-gray-600">{day.dayName}</div>
              <div className="text-sm text-gray-800">{day.dayNumber}</div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-end h-32 space-x-1">
          {sixDays.map((day) => (
            <div key={day.dayKey} className="flex-1 flex flex-col items-center">
              {/* Progress bar */}
              <div className="w-full h-full flex items-end justify-center px-1">
                <div 
                  className={`w-full ${day.isToday ? 'bg-blue-500' : day.progress > 0 ? 'bg-blue-400' : 'bg-blue-300'} rounded-t transition-all duration-200 ease-in-out`}
                  style={{ height: `${day.percentage}%` }}
                ></div>
              </div>
              
              {/* Percentage */}
              <div className="mt-2 text-xs text-gray-600">
                {day.percentage}%
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 bg-gray-50 p-4 rounded-lg text-sm">
          <h3 className="font-medium text-gray-700 mb-3">
            {showHistory ? 'Past Days Breakdown' : 'Daily Breakdown'}
          </h3>
          
          <div className="space-y-3">
            {sixDays.map((day) => (
              <div key={day.dayKey} className="flex justify-between">
                <span className={day.isToday ? 'font-medium' : ''}>
                  {day.dayName} {day.dayNumber}:
                </span>
                <span className="flex space-x-2">
                  <span className="text-green-600">{formatTime(day.progress)}</span>
                  <span>/</span>
                  <span className="text-blue-600">{formatTime(day.goal)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyProgress 
import { useState, useEffect } from 'react'

function TechInsights() {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState(() => {
    return localStorage.getItem('workTracker_lastInsightTime') || null
  })

  // Function to fetch AI insights using the API key
  const fetchAIInsight = async () => {
    setLoading(true)
    
    try {
      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('API key not found. Please add it to your .env file.');
      }
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in software development, coding, and AI technologies like large language models (LLMs). Provide technically accurate, insightful information about programming languages, frameworks, best practices, and AI technologies. Focus on practical knowledge that would be valuable for developers.'
            },
            {
              role: 'user',
              content: 'Share a useful technical insight about one of the following topics: (1) Modern coding patterns or techniques, (2) Practical LLM applications for developers, (3) New programming frameworks or tools, or (4) Software architecture best practices. Include specific code concepts, techniques, or implementation details where relevant. Make it technical but concise (3-4 sentences).'
            }
          ],
          max_tokens: 200
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      const newInsight = data.choices[0].message.content;
      
      // Update state with new insight
      setInsight(newInsight)
      
      // Save the current time as last fetch time
      const now = new Date().toISOString()
      localStorage.setItem('workTracker_lastInsightTime', now)
      localStorage.setItem('workTracker_lastInsight', newInsight)
      setLastFetchTime(now)
    } catch (error) {
      console.error('Error fetching AI insight:', error)
      setInsight(`Failed to fetch technical insight: ${error.message}. Please check your API key and try again.`)
    } finally {
      setLoading(false)
    }
  }

  // Load saved insight on mount
  useEffect(() => {
    const savedInsight = localStorage.getItem('workTracker_lastInsight')
    if (savedInsight) {
      setInsight(savedInsight)
    } else {
      // If no saved insight, fetch a new one
      fetchAIInsight()
    }
  }, [])

  // Check if an hour has passed since last fetch
  useEffect(() => {
    // Function to check and update if needed
    const checkAndUpdate = () => {
      if (!lastFetchTime) return
      
      const now = new Date()
      const lastFetch = new Date(lastFetchTime)
      const hoursPassed = (now - lastFetch) / (1000 * 60 * 60)
      
      if (hoursPassed >= 1) {
        fetchAIInsight()
      }
    }
    
    // Check immediately on mount
    checkAndUpdate()
    
    // Set up interval to check every minute
    const intervalId = setInterval(checkAndUpdate, 60 * 1000)
    
    // Clean up on unmount
    return () => clearInterval(intervalId)
  }, [lastFetchTime])

  // Format the insight text with proper styling and line breaks
  const formatInsight = (text) => {
    if (!text) return '';
    
    // Split by paragraph markers like double newlines
    const paragraphs = text.split(/\n\n+/);
    
    return (
      <div className="space-y-3">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow bg-white rounded-lg mb-4 overflow-y-auto">
        <div className="p-4 border-b border-gray-100 mb-2">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-3"></div>
                <p className="text-blue-600 font-medium">Fetching insights...</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-blue max-w-none">
              {formatInsight(insight)}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
        <span>
          {lastFetchTime ? (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Updated:</span> {new Date(lastFetchTime).toLocaleTimeString()}
            </span>
          ) : 'Not updated yet'}
        </span>
        
        <button
          onClick={fetchAIInsight}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm rounded-lg shadow-sm transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
        >
          Refresh Insights
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        <p>Powered by GPT-4o • Updates hourly</p>
      </div>
    </div>
  )
}

export default TechInsights 
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

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Technical Insights</h2>
      
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 mb-4 flex-grow">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-pulse text-indigo-600 text-lg">Fetching latest coding & LLM insights...</div>
          </div>
        ) : (
          <p className="text-gray-700 leading-relaxed text-lg">{insight}</p>
        )}
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
        <span>
          {lastFetchTime ? (
            <>
              <span className="font-medium">Updated:</span> {new Date(lastFetchTime).toLocaleTimeString()}
            </>
          ) : 'Not updated yet'}
        </span>
        
        <button
          onClick={fetchAIInsight}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition disabled:opacity-50"
        >
          New Tip
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Using GPT-4o for coding, development, and LLM technical insights.</p>
      </div>
    </div>
  )
}

export default TechInsights 
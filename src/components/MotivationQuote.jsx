import { useState, useEffect, useRef } from 'react';

function MotivationQuote({ isTimerRunning }) {
  const [quote, setQuote] = useState({
    text: "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks, and then starting on the first one.",
    author: "Mark Twain"
  });
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(() => {
    return localStorage.getItem('workTracker_lastQuoteTime') || null;
  });

  // Function to fetch AI motivation quote
  const fetchMotivationQuote = async () => {
    setLoading(true);
    
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
              content: 'You are a motivational coach specializing in productivity and professional development. Provide inspiring but practical quotes that will motivate developers and professionals to improve their productivity, focus, and work habits.'
            },
            {
              role: 'user',
              content: 'Generate a short, powerful motivational quote about productivity, focus, or professional growth. Include the author\'s name. Keep the quote concise (under 200 characters) and impactful. Format your response as JSON with "text" and "author" fields only with no explanation.'
            }
          ],
          max_tokens: 150
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      const quoteResponse = data.choices[0].message.content;
      
      // Parse the JSON response
      let newQuote;
      try {
        // Try to parse the response as JSON
        newQuote = JSON.parse(quoteResponse);
      } catch (e) {
        // If parsing fails, try to extract quote and author with regex
        const quoteMatch = quoteResponse.match(/"text":\s*"([^"]+)"/);
        const authorMatch = quoteResponse.match(/"author":\s*"([^"]+)"/);
        
        if (quoteMatch && authorMatch) {
          newQuote = {
            text: quoteMatch[1],
            author: authorMatch[1]
          };
        } else {
          // Last resort: use the raw text and a default author
          newQuote = {
            text: quoteResponse.replace(/["""]/g, '').substring(0, 200),
            author: "Unknown"
          };
        }
      }
      
      // Update state with new quote
      setQuote(newQuote);
      
      // Save the current time as last fetch time
      const now = new Date().toISOString();
      localStorage.setItem('workTracker_lastQuoteTime', now);
      localStorage.setItem('workTracker_lastQuote', JSON.stringify(newQuote));
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching motivation quote:', error);
      // Keep using the existing quote on error
    } finally {
      setLoading(false);
    }
  };

  // Load saved quote on mount
  useEffect(() => {
    const savedQuote = localStorage.getItem('workTracker_lastQuote');
    if (savedQuote) {
      try {
        setQuote(JSON.parse(savedQuote));
      } catch (e) {
        // If there's an error parsing, we'll just use the default quote
        console.error('Error parsing saved quote:', e);
      }
    } else {
      // If no saved quote, fetch a new one
      fetchMotivationQuote();
    }
  }, []);

  // Check if 6 hours have passed since last fetch
  useEffect(() => {
    // Function to check and update if needed
    const checkAndUpdate = () => {
      if (!lastFetchTime) return;
      
      const now = new Date();
      const lastFetch = new Date(lastFetchTime);
      const hoursPassed = (now - lastFetch) / (1000 * 60 * 60);
      
      if (hoursPassed >= 6) {
        fetchMotivationQuote();
      }
    };
    
    // Check immediately on mount
    checkAndUpdate();
    
    // Set up interval to check every 30 minutes
    const intervalId = setInterval(checkAndUpdate, 30 * 60 * 1000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [lastFetchTime]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold mb-4">Daily Motivation</h3>
      
      <div className="mb-4">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="w-8 h-8 border-t-2 border-white border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <p className="italic text-white text-lg">"{quote.text}"</p>
            <p className="mt-3 text-white/80">— {quote.author}</p>
          </>
        )}
      </div>
      
      {/* Animated character working on computer */}
      <div className="mt-auto">
        <div className="working-character-animation">
          <div className="scene">
            <div className={`character ${isTimerRunning ? 'working' : 'idle'}`}>
              <div className="laptop">
                <div className="screen"></div>
                <div className="keyboard"></div>
              </div>
              <div className="character-body">
                <div className="head">
                  <div className="face"></div>
                </div>
                <div className="arms">
                  <div className="arm-left"></div>
                  <div className="arm-right"></div>
                </div>
              </div>
              <div className="desk"></div>
            </div>
            <div className="rewards">
              <div className="reward star-1">⭐</div>
              <div className="reward star-2">🏆</div>
              <div className="reward star-3">💎</div>
              <div className="reward star-4">🚀</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-white/60 mt-3 flex justify-between items-center">
        <span>New quote every 6 hours</span>
        <button 
          onClick={fetchMotivationQuote} 
          disabled={loading}
          className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

export default MotivationQuote; 
import { useState, useEffect } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import WorkTracker from './components/WorkTracker'

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('workTracker_user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('workTracker_user', JSON.stringify(user))
    }
  }, [user])

  const handleSetUser = (name) => {
    setUser({ name })
  }

  return (
    <div className="min-h-screen w-full bg-gray-100">
      {!user ? (
        <WelcomeScreen onSubmit={handleSetUser} />
      ) : (
        <WorkTracker user={user} />
      )}
    </div>
  )
}

export default App 
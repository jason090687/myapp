import { createContext, useContext, useState, useEffect } from 'react'

const ActivityContext = createContext()

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([])

  // Load activities from localStorage on mount
  useEffect(() => {
    const savedActivities = localStorage.getItem('appActivities')
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities))
    }
  }, [])

  // Save activities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appActivities', JSON.stringify(activities))
  }, [activities])

  const addActivity = (activity) => {
    const newActivity = {
      id: Date.now(),
      timestamp: new Date(),
      ...activity
    }
    setActivities([newActivity, ...activities])
  }

  const clearActivities = () => {
    setActivities([])
  }

  return (
    <ActivityContext.Provider value={{ activities, addActivity, clearActivities }}>
      {children}
    </ActivityContext.Provider>
  )
}

export function useActivity() {
  const context = useContext(ActivityContext)
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider')
  }
  return context
}

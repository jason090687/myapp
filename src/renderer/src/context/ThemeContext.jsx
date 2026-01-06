import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children, defaultTheme = 'system', storageKey = 'app-theme' }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      return stored || defaultTheme
    }
    return defaultTheme
  })

  const [mountedTheme, setMountedTheme] = useState(theme)

  useEffect(() => {
    setMountedTheme(theme)
  }, [theme])

  // Determine the actual theme (dark/light) based on system preference if theme is 'system'
  const getEffectiveTheme = (currentTheme) => {
    if (currentTheme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    return currentTheme
  }

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement
    const effectiveTheme = getEffectiveTheme(mountedTheme)

    // Remove old theme classes
    root.classList.remove('light', 'dark')

    // Add new theme class
    root.classList.add(effectiveTheme)

    // Also set data attribute for CSS selectors
    root.setAttribute('data-theme', effectiveTheme)
  }, [mountedTheme])

  // Listen to system theme changes
  useEffect(() => {
    if (mountedTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = () => {
        const root = document.documentElement
        const effectiveTheme = getEffectiveTheme('system')
        root.classList.remove('light', 'dark')
        root.classList.add(effectiveTheme)
        root.setAttribute('data-theme', effectiveTheme)
      }

      // Modern browsers support addEventListener on MediaQueryList
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
      }
    }
  }, [mountedTheme])

  const setThemeMode = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
      setTheme(newTheme)
      localStorage.setItem(storageKey, newTheme)
    }
  }

  const value = {
    theme: mountedTheme,
    setTheme: setThemeMode,
    effectiveTheme: getEffectiveTheme(mountedTheme)
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

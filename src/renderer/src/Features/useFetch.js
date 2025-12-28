import { useCallback, useEffect, useState } from 'react'

const useFetch = (fetchFunction, autoFetch = true, params = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFunction(...params)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, JSON.stringify(params)])

  const reset = () => {
    setData(null)
    setError(null)
    setLoading(false)
  }

  useEffect(() => {
    if (autoFetch && params.every((param) => param !== null && param !== undefined)) {
      fetchData()
    }
  }, [autoFetch, fetchData, JSON.stringify(params)])

  return { data, loading, error, refetch: fetchData, reset }
}

export default useFetch

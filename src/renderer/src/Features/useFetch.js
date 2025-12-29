import { useCallback, useEffect, useState, useRef } from 'react'

const useFetch = (fetchFunction, autoFetch = true, params = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false)

  const fetchData = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFunction(...params)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [fetchFunction, ...params])

  const reset = () => {
    setData(null)
    setError(null)
    setLoading(false)
    fetchingRef.current = false
  }

  useEffect(() => {
    if (
      autoFetch &&
      params.every((param) => param !== null && param !== undefined) &&
      !fetchingRef.current
    ) {
      fetchData()
    }
  }, [autoFetch, fetchData, ...params])

  return { data, loading, error, refetch: fetchData, reset }
}

export default useFetch

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface Contact { id: string; name: string; lastSeenText: string; avatarUrl?: string }
export interface Page<T> { items: T[]; nextCursor?: string | null }

export type FetchContacts = (params: { query: string; cursor?: string | null; limit: number }) => Promise<Page<Contact>>

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export function useInfiniteContacts(params: {
  query: string
  pageSize?: number
  fetchContacts: FetchContacts
}) {
  const { fetchContacts, pageSize = 30 } = params
  const debouncedQuery = useDebounced(params.query, 300)

  // Internal state roughly mirroring react-query's useInfiniteQuery
  const [pages, setPages] = useState<Page<Contact>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState<Error | null>(null)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)

  const currentCursor = pages.length ? pages[pages.length - 1].nextCursor ?? null : null
  const hasNextPage = pages.length === 0 || currentCursor !== null && currentCursor !== undefined

  const mounted = useRef(true)
  useEffect(() => { return () => { mounted.current = false } }, [])

  // Load first page whenever debounced query changes
  useEffect(() => {
    let canceled = false
    setIsLoading(true)
    setIsError(null)
    fetchContacts({ query: debouncedQuery, cursor: null, limit: pageSize })
      .then((pg) => { if (!canceled && mounted.current) setPages([pg]) })
      .catch((e) => { if (!canceled && mounted.current) setIsError(e instanceof Error ? e : new Error('Failed')) })
      .finally(() => { if (!canceled && mounted.current) setIsLoading(false) })
    return () => { canceled = true }
  }, [debouncedQuery, pageSize, fetchContacts])

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage || isLoading) return
    setIsFetchingNextPage(true)
    try {
      const next = await fetchContacts({ query: debouncedQuery, cursor: currentCursor, limit: pageSize })
      if (!mounted.current) return
      setPages((p) => [...p, next])
    } catch (e) {
      if (!mounted.current) return
      setIsError(e as Error)
    } finally {
      if (mounted.current) setIsFetchingNextPage(false)
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchContacts, debouncedQuery, currentCursor, pageSize])

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setIsError(null)
    try {
      const pg = await fetchContacts({ query: debouncedQuery, cursor: null, limit: pageSize })
      if (!mounted.current) return
      setPages([pg])
    } catch (e) {
      if (!mounted.current) return
      setIsError(e as Error)
    } finally {
      if (mounted.current) setIsLoading(false)
    }
  }, [fetchContacts, debouncedQuery, pageSize])

  const flat = useMemo(() => pages.flatMap((p) => p.items), [pages])

  return {
    items: flat,
    isLoading,
    isError,
    error: isError,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  }
}

export default useInfiniteContacts


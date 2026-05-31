import { useState, useCallback, useEffect } from 'react'
import { favoriteApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export function useFavorites() {
  const { user } = useAuthStore()
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    if (!user) { setFavorites([]); return }
    favoriteApi.findMy()
      .then(({ data }) => setFavorites((data || []).map((f: any) => f.targetId)))
      .catch(() => {})
  }, [user?.id])

  const toggleFavorite = useCallback(async (id: string) => {
    if (!user) return
    const wasFav = favorites.includes(id)
    // Optimistic update
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    )
    try {
      await favoriteApi.toggle({ targetType: 'photo', targetId: id })
    } catch {
      // Revert on failure
      setFavorites((prev) =>
        wasFav ? [...prev, id] : prev.filter((f) => f !== id),
      )
    }
  }, [user, favorites])

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  )

  return { favorites, toggleFavorite, isFavorite }
}

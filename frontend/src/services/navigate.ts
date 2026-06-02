import type { NavigateFunction } from 'react-router-dom'

let navigateFn: NavigateFunction | null = null

export const setNavigate = (fn: NavigateFunction) => {
  navigateFn = fn
}

export const navigate = (path: string) => {
  if (navigateFn) navigateFn(path)
  else window.location.href = path
}

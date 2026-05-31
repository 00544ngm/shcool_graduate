import { lazy, Suspense } from 'react'

const StarfieldInner = lazy(() =>
  import('./StarfieldInner').then((m) => ({ default: m.StarfieldInner })),
)

export function Starfield() {
  return (
    <Suspense fallback={null}>
      <StarfieldInner />
    </Suspense>
  )
}

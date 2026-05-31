import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-lg',
}

function Avatar({ className, src, alt, fallback, size = 'md', ...props }: AvatarProps) {
  const [error, setError] = React.useState(false)

  if (src && !error) {
    return (
      <div className={cn('relative overflow-hidden rounded-full', sizeMap[size], className)} {...props}>
        <img
          src={src}
          alt={alt || ''}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      </div>
    )
  }

  const initials = fallback
    ? fallback.slice(0, 2).toUpperCase()
    : alt
      ? alt.slice(0, 2).toUpperCase()
      : '?'

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-accent/20 font-medium text-accent',
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  )
}

export { Avatar }

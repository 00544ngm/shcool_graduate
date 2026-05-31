import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface CityPoint {
  city: string
  count: number
  x: number // percentage position (0-100)
  y: number
}

// Approximate positions of major Chinese cities on a stylized map
// x=left-right, y=top-bottom
const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  '北京': { x: 52, y: 18 },
  '上海': { x: 67, y: 35 },
  '广州': { x: 55, y: 56 },
  '深圳': { x: 56, y: 58 },
  '杭州': { x: 65, y: 34 },
  '成都': { x: 38, y: 36 },
  '武汉': { x: 52, y: 35 },
  '西安': { x: 43, y: 28 },
  '南京': { x: 60, y: 32 },
  '重庆': { x: 40, y: 40 },
  '天津': { x: 54, y: 17 },
  '苏州': { x: 65, y: 33 },
  '长沙': { x: 52, y: 42 },
  '郑州': { x: 52, y: 26 },
  '东莞': { x: 57, y: 57 },
  '青岛': { x: 64, y: 22 },
  '沈阳': { x: 60, y: 10 },
  '宁波': { x: 68, y: 37 },
  '昆明': { x: 34, y: 48 },
  '大连': { x: 64, y: 14 },
  '厦门': { x: 63, y: 50 },
  '合肥': { x: 56, y: 33 },
  '佛山': { x: 54, y: 55 },
  '福州': { x: 63, y: 46 },
  '哈尔滨': { x: 62, y: 4 },
  '济南': { x: 57, y: 23 },
  '温州': { x: 66, y: 40 },
  '长春': { x: 61, y: 8 },
  '石家庄': { x: 51, y: 22 },
  '常州': { x: 64, y: 32 },
  '泉州': { x: 62, y: 49 },
  '南宁': { x: 44, y: 58 },
  '贵阳': { x: 40, y: 46 },
  '南昌': { x: 56, y: 40 },
  '太原': { x: 49, y: 24 },
  '烟台': { x: 64, y: 20 },
  '嘉兴': { x: 66, y: 36 },
  '南通': { x: 65, y: 30 },
  '金华': { x: 65, y: 39 },
  '珠海': { x: 55, y: 60 },
  '惠州': { x: 57, y: 56 },
  '徐州': { x: 57, y: 27 },
  '海口': { x: 46, y: 70 },
  '乌鲁木齐': { x: 10, y: 12 },
  '兰州': { x: 36, y: 26 },
  '拉萨': { x: 20, y: 40 },
  '呼和浩特': { x: 48, y: 14 },
  '银川': { x: 40, y: 22 },
  '西宁': { x: 34, y: 24 },
  '台北': { x: 70, y: 47 },
  '香港': { x: 56, y: 61 },
  '澳门': { x: 55, y: 63 },
}

/* Simplified China outline as SVG path (rough approximation) */
const CHINA_PATH = 'M30,15 L45,5 L60,2 L68,8 L72,20 L70,30 L75,35 L72,45 L68,50 L65,55 L60,62 L55,65 L50,68 L45,65 L40,62 L35,60 L30,55 L25,50 L22,45 L20,38 L18,30 L22,22 L25,18 Z'

interface ChinaMapProps {
  cities: Array<{ city: string; count: number }>
}

export function ChinaMap({ cities }: ChinaMapProps) {
  const points: CityPoint[] = useMemo(() => {
    return cities
      .map((c) => {
        const pos = CITY_POSITIONS[c.city]
        if (!pos) return null
        return { city: c.city, count: c.count, ...pos }
      })
      .filter((p): p is CityPoint => p !== null)
  }, [cities])

  const maxCount = Math.max(...points.map((p) => p.count), 1)

  return (
    <div className="relative mx-auto w-full max-w-2xl aspect-[4/3]">
      {/* China outline */}
      <svg viewBox="0 0 100 75" className="h-full w-full">
        {/* Background map outline */}
        <path
          d={CHINA_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-border"
          opacity={0.7}
        />

        {/* Dotted border effect */}
        <path
          d={CHINA_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="1,3"
          className="text-accent/20"
        />

        {/* Connection lines between cities */}
        {points.length > 1 && (
          <g className="text-accent/10">
            {points.map((p, i) =>
              points.slice(i + 1).map((q, j) => (
                <line
                  key={`${i}-${j}`}
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  stroke="currentColor"
                  strokeWidth="0.15"
                />
              )),
            )}
          </g>
        )}

        {/* City dots */}
        {points.map((p, idx) => {
          const radius = Math.max(2, (p.count / maxCount) * 8)
          return (
            <motion.g
              key={p.city}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 100 }}
            >
              {/* Glow */}
              <circle
                cx={p.x}
                cy={p.y}
                r={radius * 2.5}
                fill="currentColor"
                className="text-accent/10"
              />
              {/* Dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={radius}
                fill="currentColor"
                className="text-accent"
              />
              {/* Label */}
              <text
                x={p.x}
                y={p.y - radius - 2}
                textAnchor="middle"
                className="fill-text-secondary"
                fontSize="1.8"
                fontWeight="500"
              >
                {p.city}
              </text>
              {/* Count */}
              <text
                x={p.x}
                y={p.y + radius + 4}
                textAnchor="middle"
                className="fill-text-muted"
                fontSize="1.2"
              >
                {p.count}人
              </text>
            </motion.g>
          )
        })}
      </svg>

      {points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
          暂无城市数据
        </div>
      )}
    </div>
  )
}

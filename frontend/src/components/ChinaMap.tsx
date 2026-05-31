import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface CityPoint {
  city: string
  count: number
  x: number
  y: number
}

// Approximate city positions on the map (100x70 coordinate space)
const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  '北京': { x: 52, y: 16 }, '上海': { x: 67, y: 33 }, '广州': { x: 55, y: 55 },
  '深圳': { x: 56, y: 57 }, '杭州': { x: 65, y: 32 }, '成都': { x: 38, y: 35 },
  '武汉': { x: 52, y: 33 }, '西安': { x: 43, y: 26 }, '南京': { x: 60, y: 30 },
  '重庆': { x: 40, y: 38 }, '天津': { x: 54, y: 15 }, '苏州': { x: 64, y: 31 },
  '长沙': { x: 52, y: 40 }, '郑州': { x: 52, y: 24 }, '东莞': { x: 57, y: 56 },
  '青岛': { x: 64, y: 20 }, '沈阳': { x: 60, y: 8 }, '宁波': { x: 68, y: 35 },
  '昆明': { x: 34, y: 47 }, '大连': { x: 64, y: 12 }, '厦门': { x: 63, y: 48 },
  '合肥': { x: 57, y: 31 }, '佛山': { x: 54, y: 53 }, '福州': { x: 63, y: 44 },
  '哈尔滨': { x: 62, y: 3 }, '济南': { x: 58, y: 21 }, '温州': { x: 67, y: 38 },
  '长春': { x: 61, y: 6 }, '石家庄': { x: 52, y: 20 }, '常州': { x: 64, y: 30 },
  '泉州': { x: 62, y: 47 }, '南宁': { x: 44, y: 56 }, '贵阳': { x: 40, y: 44 },
  '南昌': { x: 57, y: 38 }, '太原': { x: 49, y: 22 }, '烟台': { x: 64, y: 18 },
  '嘉兴': { x: 66, y: 34 }, '南通': { x: 65, y: 28 }, '金华': { x: 65, y: 37 },
  '珠海': { x: 55, y: 59 }, '惠州': { x: 56, y: 55 }, '徐州': { x: 57, y: 25 },
  '海口': { x: 44, y: 67 }, '乌鲁木齐': { x: 10, y: 11 }, '兰州': { x: 36, y: 25 },
  '拉萨': { x: 22, y: 37 }, '呼和浩特': { x: 46, y: 12 }, '银川': { x: 40, y: 21 },
  '西宁': { x: 34, y: 23 }, '台北': { x: 70, y: 45 }, '香港': { x: 56, y: 60 },
  '澳门': { x: 55, y: 62 },
}

/* Better China outline — more detailed, recognizable shape */
const CHINA_PATH = 'M58,3 L63,2 L67,4 L71,7 L73,11 L74,15 L73,18 L71,20 L73,23 L75,25 L73,27 L70,29 L68,32 L66,36 L64,40 L61,44 L59,48 L56,52 L54,56 L52,60 L50,62 L48,64 L45,63 L43,62 L40,63 L38,61 L36,59 L34,56 L32,53 L30,50 L28,47 L26,44 L24,42 L22,40 L20,38 L18,36 L16,34 L14,31 L12,28 L10,25 L8,22 L7,19 L6,16 L7,13 L9,11 L12,9 L16,7 L20,6 L25,5 L30,4 L35,4 L40,3 L45,3 L50,3 L55,3 Z'

interface ChinaMapProps {
  cities: Array<{ city: string; count: number }>
}

export function ChinaMap({ cities }: ChinaMapProps) {
  // City points
  const points: CityPoint[] = useMemo(() => {
    return cities
      .map((c) => {
        const pos = CITY_POSITIONS[c.city]
        if (!pos) return null
        return { city: c.city, count: c.count, x: pos.x, y: pos.y }
      })
      .filter((p): p is CityPoint => p !== null)
  }, [cities])

  const maxCount = Math.max(...points.map((p) => p.count), 1)

  return (
    <div className="relative mx-auto w-full max-w-2xl aspect-[4/3]">
      <svg viewBox="0 0 100 72" className="h-full w-full">
        {/* China outline */}
        <path
          d={CHINA_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
          className="text-border"
          opacity={0.6}
        />
        <path
          d={CHINA_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="1.5,3"
          className="text-accent/15"
        />

        {/* Hainan Island */}
        <ellipse cx={46} cy={68} rx={2.5} ry={2} fill="none" stroke="currentColor" strokeWidth="0.3" className="text-border" opacity={0.5} />
        {/* Taiwan Island */}
        <ellipse cx={73} cy={46} rx={1.5} ry={3} fill="none" stroke="currentColor" strokeWidth="0.3" className="text-border" opacity={0.5} />

        {/* City dots — small dot, brightness = count */}
        {points.map((p, idx) => {
          const intensity = p.count / maxCount
          const dotR = 1.2 + intensity * 1.8  // dot radius 1.2~3.0
          const opacity = 0.4 + intensity * 0.6  // opacity 0.4~1.0
          const glowR = dotR * 3  // outer glow
          const glowOpacity = 0.08 + intensity * 0.25

          return (
            <motion.g
              key={p.city}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.04, type: 'spring', stiffness: 120, damping: 12 }}
            >
              {/* Outer glow */}
              <circle cx={p.x} cy={p.y} r={glowR} fill="currentColor" className="text-accent" opacity={glowOpacity} />
              {/* Main dot */}
              <circle cx={p.x} cy={p.y} r={dotR} fill="currentColor" className="text-accent" opacity={opacity} />
              {/* City label */}
              <text x={p.x} y={p.y - dotR - 1.5} textAnchor="middle" className="fill-text-secondary" fontSize="1.6" fontWeight="500" opacity={0.9}>
                {p.city}
              </text>
              {/* Count label */}
              <text x={p.x} y={p.y + dotR + 3} textAnchor="middle" className="fill-text-muted" fontSize="1.1" opacity={0.7}>
                {p.count}人
              </text>
            </motion.g>
          )
        })}

        {points.length === 0 && (
          <text x={50} y={36} textAnchor="middle" className="fill-text-muted" fontSize="2.5">
            暂无城市数据
          </text>
        )}
      </svg>

      {/* Legend — dot brightness */}
      {points.length > 0 && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-bg-card/80 px-2.5 py-1.5 backdrop-blur-sm border border-border">
          <span className="text-[10px] text-text-muted">少</span>
          {[0.2, 0.4, 0.6, 0.8, 1].map((o, i) => (
            <div key={i} className="h-3 w-3 rounded-full" style={{ backgroundColor: 'rgb(245,158,11)', opacity: o }} />
          ))}
          <span className="text-[10px] text-text-muted">多</span>
        </div>
      )}
    </div>
  )
}

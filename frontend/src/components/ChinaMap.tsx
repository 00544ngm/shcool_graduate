import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface CityPoint {
  city: string
  count: number
  x: number
  y: number
  province: string
}

// City → Province mapping
const CITY_PROVINCE: Record<string, string> = {
  '北京': '北京', '上海': '上海', '天津': '天津', '重庆': '重庆',
  '广州': '广东', '深圳': '广东', '东莞': '广东', '佛山': '广东', '珠海': '广东', '惠州': '广东',
  '杭州': '浙江', '宁波': '浙江', '温州': '浙江', '嘉兴': '浙江', '金华': '浙江',
  '南京': '江苏', '苏州': '江苏', '常州': '江苏', '南通': '江苏', '徐州': '江苏',
  '成都': '四川',
  '武汉': '湖北',
  '西安': '陕西',
  '长沙': '湖南',
  '郑州': '河南',
  '青岛': '山东', '济南': '山东', '烟台': '山东',
  '沈阳': '辽宁', '大连': '辽宁',
  '昆明': '云南',
  '厦门': '福建', '福州': '福建', '泉州': '福建',
  '合肥': '安徽',
  '哈尔滨': '黑龙江',
  '长春': '吉林',
  '石家庄': '河北',
  '南宁': '广西',
  '贵阳': '贵州',
  '南昌': '江西',
  '太原': '山西',
  '海口': '海南',
  '乌鲁木齐': '新疆',
  '兰州': '甘肃',
  '拉萨': '西藏',
  '呼和浩特': '内蒙古',
  '银川': '宁夏',
  '西宁': '青海',
  '台北': '台湾',
  '香港': '香港',
  '澳门': '澳门',
}

// Approximate province centers for heat circles
const PROVINCE_CENTERS: Record<string, { x: number; y: number }> = {
  '北京': { x: 52, y: 18 }, '上海': { x: 67, y: 35 }, '天津': { x: 54, y: 17 }, '重庆': { x: 40, y: 40 },
  '广东': { x: 55, y: 57 }, '浙江': { x: 66, y: 36 }, '江苏': { x: 62, y: 31 },
  '四川': { x: 36, y: 38 }, '湖北': { x: 51, y: 36 }, '陕西': { x: 43, y: 28 },
  '湖南': { x: 51, y: 43 }, '河南': { x: 51, y: 27 }, '山东': { x: 60, y: 22 },
  '辽宁': { x: 62, y: 11 }, '云南': { x: 33, y: 49 }, '福建': { x: 62, y: 47 },
  '安徽': { x: 57, y: 33 }, '黑龙江': { x: 62, y: 4 }, '吉林': { x: 61, y: 8 },
  '河北': { x: 51, y: 22 }, '广西': { x: 44, y: 58 }, '贵州': { x: 40, y: 46 },
  '江西': { x: 57, y: 41 }, '山西': { x: 49, y: 24 }, '海南': { x: 46, y: 70 },
  '新疆': { x: 10, y: 12 }, '甘肃': { x: 36, y: 26 }, '西藏': { x: 20, y: 40 },
  '内蒙古': { x: 48, y: 14 }, '宁夏': { x: 40, y: 22 }, '青海': { x: 34, y: 24 },
  '台湾': { x: 70, y: 47 }, '香港': { x: 56, y: 61 }, '澳门': { x: 55, y: 63 },
}

// Approximate city positions on the map
const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  '北京': { x: 52, y: 18 }, '上海': { x: 67, y: 35 }, '广州': { x: 55, y: 56 },
  '深圳': { x: 56, y: 58 }, '杭州': { x: 65, y: 34 }, '成都': { x: 38, y: 36 },
  '武汉': { x: 52, y: 35 }, '西安': { x: 43, y: 28 }, '南京': { x: 60, y: 32 },
  '重庆': { x: 40, y: 40 }, '天津': { x: 54, y: 17 }, '苏州': { x: 65, y: 33 },
  '长沙': { x: 52, y: 42 }, '郑州': { x: 52, y: 26 }, '东莞': { x: 57, y: 57 },
  '青岛': { x: 64, y: 22 }, '沈阳': { x: 60, y: 10 }, '宁波': { x: 68, y: 37 },
  '昆明': { x: 34, y: 48 }, '大连': { x: 64, y: 14 }, '厦门': { x: 63, y: 50 },
  '合肥': { x: 56, y: 33 }, '佛山': { x: 54, y: 55 }, '福州': { x: 63, y: 46 },
  '哈尔滨': { x: 62, y: 4 }, '济南': { x: 57, y: 23 }, '温州': { x: 66, y: 40 },
  '长春': { x: 61, y: 8 }, '石家庄': { x: 51, y: 22 }, '常州': { x: 64, y: 32 },
  '泉州': { x: 62, y: 49 }, '南宁': { x: 44, y: 58 }, '贵阳': { x: 40, y: 46 },
  '南昌': { x: 56, y: 40 }, '太原': { x: 49, y: 24 }, '烟台': { x: 64, y: 20 },
  '嘉兴': { x: 66, y: 36 }, '南通': { x: 65, y: 30 }, '金华': { x: 65, y: 39 },
  '珠海': { x: 55, y: 60 }, '惠州': { x: 57, y: 56 }, '徐州': { x: 57, y: 27 },
  '海口': { x: 46, y: 70 }, '乌鲁木齐': { x: 10, y: 12 }, '兰州': { x: 36, y: 26 },
  '拉萨': { x: 20, y: 40 }, '呼和浩特': { x: 48, y: 14 }, '银川': { x: 40, y: 22 },
  '西宁': { x: 34, y: 24 }, '台北': { x: 70, y: 47 }, '香港': { x: 56, y: 61 },
  '澳门': { x: 55, y: 63 },
}

/* Simplified China outline as SVG path */
const CHINA_PATH = 'M30,15 L45,5 L60,2 L68,8 L72,20 L70,30 L75,35 L72,45 L68,50 L65,55 L60,62 L55,65 L50,68 L45,65 L40,62 L35,60 L30,55 L25,50 L22,45 L20,38 L18,30 L22,22 L25,18 Z'

interface ChinaMapProps {
  cities: Array<{ city: string; count: number }>
}

const HEAT_COLORS = [
  'rgba(245,158,11,0.05)',
  'rgba(245,158,11,0.12)',
  'rgba(245,158,11,0.22)',
  'rgba(245,158,11,0.35)',
  'rgba(245,158,11,0.50)',
  'rgba(245,158,11,0.70)',
]

export function ChinaMap({ cities }: ChinaMapProps) {
  // Aggregate by province
  const provinceData = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of cities) {
      const province = CITY_PROVINCE[c.city] || c.city
      map.set(province, (map.get(province) || 0) + c.count)
    }
    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
      center: PROVINCE_CENTERS[name] || { x: 50, y: 35 },
    }))
  }, [cities])

  // City dots with province info
  const points: CityPoint[] = useMemo(() => {
    return cities
      .map((c) => {
        const pos = CITY_POSITIONS[c.city]
        if (!pos) return null
        return { city: c.city, count: c.count, ...pos, province: CITY_PROVINCE[c.city] || c.city }
      })
      .filter((p): p is CityPoint => p !== null)
  }, [cities])

  const maxProvinceCount = Math.max(...provinceData.map((p) => p.count), 1)
  const maxCityCount = Math.max(...points.map((p) => p.count), 1)

  return (
    <div className="relative mx-auto w-full max-w-2xl aspect-[4/3]">
      <svg viewBox="0 0 100 75" className="h-full w-full">
        {/* China outline */}
        <path
          d={CHINA_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-border"
          opacity={0.7}
        />
        <path
          d={CHINA_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="1,3"
          className="text-accent/20"
        />

        {/* Province heat circles */}
        {provinceData.map((p, idx) => {
          const intensity = Math.min(p.count / maxProvinceCount, 1)
          const colorIdx = Math.min(Math.floor(intensity * HEAT_COLORS.length), HEAT_COLORS.length - 1)
          const radius = 5 + (p.count / maxProvinceCount) * 18
          return (
            <motion.g
              key={p.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03, duration: 0.5 }}
            >
              <circle
                cx={p.center.x}
                cy={p.center.y}
                r={radius}
                fill={HEAT_COLORS[colorIdx]}
                stroke="currentColor"
                strokeWidth="0.3"
                className="text-accent/30"
              />
              {p.count > 0 && (
                <text
                  x={p.center.x}
                  y={p.center.y + 0.8}
                  textAnchor="middle"
                  className="fill-accent"
                  fontSize="1.8"
                  fontWeight="600"
                  opacity={0.7 + intensity * 0.3}
                >
                  {p.count}
                </text>
              )}
            </motion.g>
          )
        })}

        {/* Connection lines between cities */}
        {points.length > 1 && (
          <g className="text-accent/10">
            {points.slice(0, 15).map((p, i) =>
              points.slice(i + 1, 15).map((q, j) => (
                <line
                  key={`ln-${i}-${j}`}
                  x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                  stroke="currentColor"
                  strokeWidth="0.15"
                />
              )),
            )}
          </g>
        )}

        {/* City dots */}
        {points.map((p, idx) => {
          const radius = Math.max(2, (p.count / maxCityCount) * 8)
          return (
            <motion.g
              key={p.city}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.03, type: 'spring', stiffness: 100 }}
            >
              <circle cx={p.x} cy={p.y} r={radius * 2.5} fill="currentColor" className="text-accent/10" />
              <circle cx={p.x} cy={p.y} r={radius} fill="currentColor" className="text-accent" />
              <text x={p.x} y={p.y - radius - 2} textAnchor="middle" className="fill-text-secondary" fontSize="1.8" fontWeight="500">
                {p.city}
              </text>
              <text x={p.x} y={p.y + radius + 4} textAnchor="middle" className="fill-text-muted" fontSize="1.2">
                {p.count}人
              </text>
            </motion.g>
          )
        })}
      </svg>

      {/* Legend */}
      {provinceData.length > 0 && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-bg-card/80 px-2.5 py-1.5 backdrop-blur-sm border border-border">
          <span className="text-[10px] text-text-muted">少</span>
          {HEAT_COLORS.map((color, i) => (
            <div key={i} className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
          ))}
          <span className="text-[10px] text-text-muted">多</span>
        </div>
      )}

      {points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
          暂无城市数据
        </div>
      )}
    </div>
  )
}

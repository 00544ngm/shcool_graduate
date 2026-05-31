import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Stars() {
  const ref = useRef<THREE.Points>(null)
  const count = 2000

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 100
    }
    return pos
  }, [])

  const colors = useMemo(() => {
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const shade = 0.5 + Math.random() * 0.5
      const isAmber = Math.random() > 0.7
      if (isAmber) {
        col[i * 3] = 1
        col[i * 3 + 1] = 0.7 + Math.random() * 0.3
        col[i * 3 + 2] = 0.1 + Math.random() * 0.2
      } else {
        col[i * 3] = shade
        col[i * 3 + 1] = shade
        col[i * 3 + 2] = shade
      }
    }
    return col
  }, [])

  const sizes = useMemo(() => {
    const s = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      s[i] = 0.1 + Math.random() * 0.4
    }
    return s
  }, [])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.015
      ref.current.rotation.x += delta * 0.005
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export function StarfieldInner() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false }}
        style={{ background: 'transparent' }}
      >
        <Stars />
      </Canvas>
    </div>
  )
}

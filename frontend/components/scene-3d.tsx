'use client'

import { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, OrbitControls, Stars, useTexture } from '@react-three/drei'
import * as THREE from 'three'

function ImagePlane({ imgName, index, total }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useTexture(`/${imgName}`)
  
  // Position the planes in a 3D spiral
  const angle = (index / total) * Math.PI * 4
  const radius = 8 + index * 0.5
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  const y = index - total / 2

  // Animate the plane
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (0.1 + index * 0.01)
      meshRef.current.rotation.x += delta * 0.05
      meshRef.current.position.y = y + Math.sin(Date.now() * 0.001 + index) * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={[x, y, z]} castShadow receiveShadow>
      <planeGeometry args={[4, 3]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={0.4} 
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}

function AnimatedImages() {
  const images = ['logo.png', 'placeholder.jpg', 'placeholder-user.jpg', 'placeholder-logo.png']
  
  return (
    <group>
      {images.map((imgName, index) => (
        <ImagePlane 
          key={imgName}
          imgName={imgName}
          index={index}
          total={images.length}
        />
      ))}
    </group>
  )
}

function CinematicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* CINEMATIC DARK OVERLAY */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-b
          from-black/10
          via-black/20
          to-black/40
        "
      />

      {/* ORANGE EMERGENCY GLOW */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,rgba(255,100,40,0.15),transparent_70%)]
        "
      />
    </div>
  )
}

function HolographicCity() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const elapsedRef = useRef(0)

  const gridSize = 15
  const count = gridSize * gridSize

  const dummy = useMemo(() => new THREE.Object3D(), [])

  const heights = useMemo(() => {
    const arr = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const seed = (i * 12321) % 10000
      arr[i] = 0.5 + (seed / 10000) * 3
    }

    return arr
  }, [count])

  const colors = useMemo(() => {
    const array = new Float32Array(count * 3)
    const color = new THREE.Color()

    for (let i = 0; i < count; i++) {
      const isIncident = (i * 7) % 100 > 96

      if (isIncident) {
        color.setHex(0xff6633)
      } else {
        color.setHex(0x1a4555)
      }

      color.toArray(array, i * 3)
    }

    return array
  }, [count])

  useFrame((_, delta) => {
    elapsedRef.current += delta

    if (meshRef.current) {
      meshRef.current.rotation.y = elapsedRef.current * 0.05

      let i = 0

      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          const xPos = (x - gridSize / 2) * 1.2
          const zPos = (z - gridSize / 2) * 1.2

          const baseHeight = heights[i]

          const pulse =
            Math.sin(
              elapsedRef.current * 2 +
                x * 0.5 +
                z * 0.5
            ) * 0.2

          const height = baseHeight + pulse

          dummy.position.set(
            xPos,
            height / 2 - 4,
            zPos
          )

          dummy.scale.set(0.8, height, 0.8)

          dummy.updateMatrix()

          meshRef.current.setMatrixAt(i++, dummy.matrix)
        }
      }

      meshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
    >
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </boxGeometry>

      <meshPhysicalMaterial
        vertexColors
        transparent
        opacity={0.45}
        roughness={0.2}
        metalness={0.9}
        emissive="#ff6633"
        emissiveIntensity={0.15}
        wireframe
      />
    </instancedMesh>
  )
}

function AuroraPlane() {
  const ref = useRef<THREE.Mesh>(null)
  const elapsedRef = useRef(0)

  useFrame((_, delta) => {
    elapsedRef.current += delta

    if (ref.current) {
      ref.current.rotation.z =
        elapsedRef.current * 0.04

      ;(
        ref.current.material as THREE.MeshBasicMaterial
      ).opacity =
        0.16 +
        Math.sin(elapsedRef.current * 0.6) * 0.03
    }
  })

  return (
    <mesh
      ref={ref}
      position={[0, -2.5, -3]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[60, 60]} />

      <meshBasicMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#c8553d"
      />
    </mesh>
  )
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null)
  const elapsedRef = useRef(0)

  const particleCount = 200

  const positions = useMemo(() => {
    const pos = new Float32Array(
      particleCount * 3
    )

    for (let i = 0; i < particleCount; i++) {
      const seed1 = (i * 12321) % 10000
      const seed2 = (i * 45678) % 10000
      const seed3 = (i * 78901) % 10000

      pos[i * 3] =
        (seed1 / 5000 - 1) * 15

      pos[i * 3 + 1] =
        (seed2 / 10000 - 0.5) * 20

      pos[i * 3 + 2] =
        (seed3 / 5000 - 1) * 15
    }

    return pos
  }, [])

  useFrame((_, delta) => {
    elapsedRef.current += delta

    if (particlesRef.current) {
      particlesRef.current.rotation.y =
        elapsedRef.current * 0.02

      particlesRef.current.rotation.x =
        elapsedRef.current * 0.01
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.08}
        color="#ff6633"
        transparent
        opacity={0.45}
        sizeAttenuation
      />
    </points>
  )
}

function CameraRig() {
  const { camera } = useThree()

  const target = useRef(
    new THREE.Vector3(0, 6, 12)
  )

  useFrame((state) => {
    target.current.set(
      state.pointer.x * 1.25,
      6 + state.pointer.y * 0.85,
      12
    )

    camera.position.lerp(target.current, 0.05)

    camera.lookAt(0, 0, 0)
  })

  return null
}

export default function Scene3D() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      id="scene-3d-container"
    >
      <CinematicBackground />

      <Canvas
        camera={{
          position: [0, 6, 12],
          fov: 60,
        }}
        gl={{
          antialias: true,
          alpha: true,
        }}
        dpr={[1, 1.5]}
        style={{
          background: 'transparent',
        }}
      >
        <fogExp2
          attach="fog"
          args={['#080808', 0.035]}
        />

        <CameraRig />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <ambientLight intensity={0.3} />

        <pointLight
          position={[8, 14, 10]}
          intensity={1}
          color="#ff6633"
        />

        <pointLight
          position={[-10, 8, -6]}
          intensity={0.6}
          color="#9cb7ff"
        />

        <AuroraPlane />
        
        <Suspense fallback={null}>
          {/* Our 3D animated images */}
          <AnimatedImages />
        </Suspense>

        <HolographicCity />

        <ParticleField />

        <Sparkles
          count={90}
          size={2.2}
          speed={0.35}
          opacity={0.22}
          scale={[22, 10, 22]}
          color="#ff9966"
        />
      </Canvas>
    </div>
  )
}

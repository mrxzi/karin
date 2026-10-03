import { Plane, useAspect, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import {
  EffectComposer,
  DepthOfField,
  Vignette,
} from '@react-three/postprocessing'
import { MaskFunction } from 'postprocessing'

import Fireflies from './Fireflies'
import '../materials/layerMaterial'

import bgUrl from '../resources/bg.jpg'
import starsUrl from '../resources/stars.png'
import groundUrl from '../resources/ground.png'
import bearUrl from '../resources/bear.png'
import leaves1Url from '../resources/leaves1.png'
import leaves2Url from '../resources/leaves2.png'

function Effects() {
  const ref = useRef()
  useLayoutEffect(() => {
    if (ref.current?.maskPass) {
      const maskMaterial = ref.current.maskPass.getFullscreenMaterial()
      maskMaterial.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA
    }
  })
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <DepthOfField
        ref={ref}
        target={[0, 0, 30]}
        bokehScale={8}
        focalLength={0.1}
        width={1024}
      />
      <Vignette />
    </EffectComposer>
  )
}

export default function ZustandBackground() {
  const scaleN = useAspect(1600, 1000, 1.05)
  const scaleW = useAspect(2200, 1000, 1.05)
  const textures = useTexture([
    bgUrl,
    starsUrl,
    groundUrl,
    bearUrl,
    leaves1Url,
    leaves2Url,
  ])
  const group = useRef()
  const layersRef = useRef([])
  const [movement] = useState(() => new Vector3())
  const [temp] = useState(() => new Vector3())

  // Track mouse position directly from window — works even when background canvas is covered
  const mouse = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  const layers = [
    { texture: textures[0], x: 0, y: 0, z: 0, factor: 0.005, scale: scaleW },
    { texture: textures[1], x: 0, y: 0, z: 10, factor: 0.005, scale: scaleW },
    { texture: textures[2], x: 0, y: 0, z: 20, scale: scaleW },
    {
      texture: textures[3],
      x: 0,
      y: 0,
      z: 30,
      scaleFactor: 0.83,
      scale: scaleN,
    },
    {
      texture: textures[4],
      x: 0,
      y: 0,
      z: 40,
      factor: 0.03,
      scaleFactor: 1,
      wiggle: 0.6,
      scale: scaleW,
    },
    {
      texture: textures[5],
      x: -20,
      y: -20,
      z: 49,
      factor: 0.04,
      scaleFactor: 1.3,
      wiggle: 1,
      scale: scaleW,
    },
  ]

  useFrame((_state, delta) => {
    const mx = mouse.current.x
    const my = mouse.current.y
    movement.lerp(temp.set(mx, my * 0.2, 0), 0.2)
    if (group.current) {
      group.current.position.x = MathUtils.lerp(
        group.current.position.x,
        mx * 20,
        0.05
      )
      group.current.rotation.x = MathUtils.lerp(
        group.current.rotation.x,
        my / 20,
        0.05
      )
      group.current.rotation.y = MathUtils.lerp(
        group.current.rotation.y,
        -mx / 2,
        0.05
      )
    }
    if (layersRef.current[4] && layersRef.current[5]) {
      layersRef.current[4].uniforms.time.value =
        layersRef.current[5].uniforms.time.value += delta
    }
  })


  return (
    <>
      <group ref={group}>
        <Fireflies count={20} radius={80} colors={['orange']} />
        {layers.map(
          (
            {
              scale,
              texture,
              factor = 0,
              scaleFactor = 1,
              wiggle = 0,
              x,
              y,
              z,
            },
            i
          ) => (
            <Plane
              scale={scale}
              args={[1, 1, wiggle ? 10 : 1, wiggle ? 10 : 1]}
              position={[x, y, z]}
              key={i}
            >
              <layerMaterial
                movement={movement}
                textr={texture}
                factor={factor}
                ref={(el) => (layersRef.current[i] = el)}
                wiggle={wiggle}
                scale={scaleFactor}
                transparent
              />
            </Plane>
          )
        )}
      </group>
      <Effects />
    </>
  )
}

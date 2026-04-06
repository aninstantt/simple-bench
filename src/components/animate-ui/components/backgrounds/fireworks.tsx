'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min

const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min)

const randColor = (): string => `hsl(${randInt(0, 360)}, 100%, 50%)`

type ParticleType = {
  x: number
  y: number
  color: string
  speed: number
  direction: number
  vx: number
  vy: number
  gravity: number
  friction: number
  alpha: number
  decay: number
  size: number
  update: () => void
  draw: (ctx: CanvasRenderingContext2D) => void
  isAlive: () => boolean
}

function createParticle(
  x: number,
  y: number,
  color: string,
  speed: number,
  direction: number,
  gravity: number,
  friction: number,
  size: number
): ParticleType {
  const vx = Math.cos(direction) * speed
  const vy = Math.sin(direction) * speed
  const alpha = 1
  const decay = rand(0.005, 0.02)

  return {
    x,
    y,
    color,
    speed,
    direction,
    vx,
    vy,
    gravity,
    friction,
    alpha,
    decay,
    size,
    update() {
      this.vx *= this.friction
      this.vy *= this.friction
      this.vy += this.gravity
      this.x += this.vx
      this.y += this.vy
      this.alpha -= this.decay
    },
    draw(ctx: CanvasRenderingContext2D) {
      ctx.save()
      ctx.globalAlpha = this.alpha
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()
      ctx.restore()
    },
    isAlive() {
      return this.alpha > 0
    }
  }
}

type FireworkType = {
  x: number
  y: number
  targetY: number
  color: string
  speed: number
  size: number
  angle: number
  vx: number
  vy: number
  trail: { x: number; y: number }[]
  trailLength: number
  exploded: boolean
  update: () => boolean
  explode: () => void
  draw: (ctx: CanvasRenderingContext2D) => void
}

function createFirework(
  x: number,
  y: number,
  targetY: number,
  color: string,
  speed: number,
  size: number,
  particleSpeed: { min: number; max: number } | number,
  particleSize: { min: number; max: number } | number,
  onExplode: (particles: ParticleType[]) => void
): FireworkType {
  const angle = -Math.PI / 2 + rand(-0.3, 0.3)
  const vx = Math.cos(angle) * speed
  const vy = Math.sin(angle) * speed
  const trail: { x: number; y: number }[] = []
  const trailLength = randInt(10, 25)

  return {
    x,
    y,
    targetY,
    color,
    speed,
    size,
    angle,
    vx,
    vy,
    trail,
    trailLength,
    exploded: false,
    update() {
      this.trail.push({ x: this.x, y: this.y })
      if (this.trail.length > this.trailLength) {
        this.trail.shift()
      }
      this.x += this.vx
      this.y += this.vy
      this.vy += 0.02
      if (this.vy >= 0 || this.y <= this.targetY) {
        this.explode()
        return false
      }
      return true
    },
    explode() {
      const numParticles = randInt(50, 150)
      const particles: ParticleType[] = []
      for (let i = 0; i < numParticles; i++) {
        const particleAngle = rand(0, Math.PI * 2)
        const localParticleSpeed = getValueByRange(particleSpeed)
        const localParticleSize = getValueByRange(particleSize)
        particles.push(
          createParticle(
            this.x,
            this.y,
            this.color,
            localParticleSpeed,
            particleAngle,
            0.05,
            0.98,
            localParticleSize
          )
        )
      }
      onExplode(particles)
    },
    draw(ctx: CanvasRenderingContext2D) {
      ctx.save()
      ctx.beginPath()
      if (this.trail.length > 1) {
        ctx.moveTo(this.trail[0]?.x ?? this.x, this.trail[0]?.y ?? this.y)
        for (const point of this.trail) {
          ctx.lineTo(point.x, point.y)
        }
      } else {
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x, this.y)
      }
      ctx.strokeStyle = this.color
      ctx.lineWidth = this.size
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.restore()
    }
  }
}

function getValueByRange(range: { min: number; max: number } | number): number {
  if (typeof range === 'number') {
    return range
  }
  return rand(range.min, range.max)
}

function getColor(color: string | string[] | undefined): string {
  if (Array.isArray(color)) {
    return color[randInt(0, color.length)] ?? randColor()
  }
  return color ?? randColor()
}

type FireworksBackgroundProps = Omit<React.ComponentProps<'div'>, 'color'> & {
  canvasProps?: React.ComponentProps<'canvas'>
  population?: number
  color?: string | string[]
  fireworkSpeed?: { min: number; max: number } | number
  fireworkSize?: { min: number; max: number } | number
  particleSpeed?: { min: number; max: number } | number
  particleSize?: { min: number; max: number } | number
}

function FireworksBackground({
  ref,
  className,
  canvasProps,
  population = 1,
  color,
  fireworkSpeed = { min: 4, max: 8 },
  fireworkSize = { min: 2, max: 5 },
  particleSpeed = { min: 2, max: 7 },
  particleSize = { min: 1, max: 5 },
  ...props
}: FireworksBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

  const effectRef = React.useRef<{
    cleanup?: () => void
    setActive?: (next: boolean) => void
    isActive?: boolean
  }>({})

  React.useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Ensure previous instance is fully torn down (HMR safety)
    effectRef.current.cleanup?.()

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
    const readRect = () => container.getBoundingClientRect()

    let maxX = 0
    let maxY = 0

    const applyCanvasSize = () => {
      const rect = readRect()
      const w = Math.max(0, rect.width)
      const h = Math.max(0, rect.height)
      if (!w || !h) return false
      maxX = w
      maxY = h
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      return true
    }

    if (!applyCanvasSize()) return

    const setCanvasSize = () => {
      applyCanvasSize()
    }
    window.addEventListener('resize', setCanvasSize)

    const explosions: ParticleType[] = []
    const fireworks: FireworkType[] = []

    const handleExplosion = (particles: ParticleType[]) => {
      explosions.push(...particles)
    }

    let launchTimeoutId: number | null = null
    let isActive = true

    effectRef.current.isActive = isActive

    const launchFirework = () => {
      if (!isActive) return
      const x = rand(maxX * 0.1, maxX * 0.9)
      const y = maxY
      const targetY = rand(maxY * 0.1, maxY * 0.4)
      const fireworkColor = getColor(color)
      const speed = getValueByRange(fireworkSpeed)
      const size = getValueByRange(fireworkSize)
      fireworks.push(
        createFirework(
          x,
          y,
          targetY,
          fireworkColor,
          speed,
          size,
          particleSpeed,
          particleSize,
          handleExplosion
        )
      )
      const timeout = rand(300, 800) / population
      launchTimeoutId = window.setTimeout(launchFirework, timeout)
    }

    launchFirework()

    let animationFrameId: number | null = null
    let disposed = false
    const animate = () => {
      if (disposed || !isActive) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, maxX, maxY)

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i]
        if (!firework?.update()) {
          fireworks.splice(i, 1)
        } else {
          firework.draw(ctx)
        }
      }

      for (let i = explosions.length - 1; i >= 0; i--) {
        const particle = explosions[i]
        particle?.update()
        if (particle?.isAlive()) {
          particle.draw(ctx)
        } else {
          explosions.splice(i, 1)
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    const handleClick = (event: MouseEvent) => {
      if (!isActive) return
      const x = event.clientX
      const y = maxY
      const targetY = event.clientY
      const fireworkColor = getColor(color)
      const speed = getValueByRange(fireworkSpeed)
      const size = getValueByRange(fireworkSize)
      fireworks.push(
        createFirework(
          x,
          y,
          targetY,
          fireworkColor,
          speed,
          size,
          particleSpeed,
          particleSize,
          handleExplosion
        )
      )
    }

    container.addEventListener('click', handleClick)

    const setActive = (next: boolean) => {
      if (isActive === next) return
      isActive = next
      effectRef.current.isActive = isActive
      if (isActive) {
        if (!launchTimeoutId && population > 0) {
          launchTimeoutId = window.setTimeout(launchFirework, 0)
        }
        if (!animationFrameId) animationFrameId = requestAnimationFrame(animate)
      } else {
        if (launchTimeoutId) {
          window.clearTimeout(launchTimeoutId)
          launchTimeoutId = null
        }
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
      }
    }

    effectRef.current.setActive = setActive

    const onVisibilityChange = () => {
      setActive(!document.hidden)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const cleanup = () => {
      disposed = true
      window.removeEventListener('resize', setCanvasSize)
      container.removeEventListener('click', handleClick)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (launchTimeoutId) {
        window.clearTimeout(launchTimeoutId)
        launchTimeoutId = null
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      isActive = false
      effectRef.current.isActive = isActive
      explosions.length = 0
      fireworks.length = 0
    }
    effectRef.current.cleanup = cleanup
    return cleanup
  }, [
    population,
    color,
    fireworkSpeed,
    fireworkSize,
    particleSpeed,
    particleSize
  ])

  return (
    <div
      ref={containerRef}
      data-slot="fireworks-background"
      className={cn('relative size-full overflow-hidden', className)}
      {...props}
    >
      <canvas
        {...canvasProps}
        ref={canvasRef}
        className={cn('absolute inset-0 size-full', canvasProps?.className)}
      />
    </div>
  )
}

export { FireworksBackground, type FireworksBackgroundProps }

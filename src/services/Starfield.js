/**
 * @file services/Starfield.js
 * @description Realistic 3D tunnel starfield animation with smooth trails and perspective.
 * @author Jimbo Quijano
 *
 * Stars appear as circles in front with trails tapering toward the back,
 * giving a dynamic 3D depth effect. Infinite trails create subtle texture.
 *
 */

export default class Starfield {
  /**
   * Initializes the Starfield animation.
   * @param {string} canvasId - The ID of the canvas element to render the starfield on.
   * @param {number} numStars - Total number of stars to generate.
   */
  constructor(canvasId, numStars = 200) {
    this.canvas = document.getElementById(canvasId)
    if (!this.canvas) throw new Error(`Canvas with id "${canvasId}" not found`)

    this.ctx = this.canvas.getContext('2d')
    this.numStars = numStars
    this.stars = []

    // Screen dimensions
    this.width = window.innerWidth
    this.height = window.innerHeight

    // Frame counter for optional future use (e.g., finite remnants)
    this.frameCounter = 0

    // Star speed (affects how fast they appear to move toward the camera)
    this.defaultSpeed = 5
    this.speed = this.defaultSpeed

    this.initCanvas() // Setup high-DPI canvas and resize handling
    this.initStars() // Generate initial star positions
    this.draw() // Start the animation loop
  }

  /**
   * Sets up the canvas for high-DPI (retina) devices and handles window resizing.
   * Ensures stars are rendered sharply and maintain proper scaling.
   */
  initCanvas() {
    const dpr = window.devicePixelRatio || 1

    // Set canvas size according to device pixel ratio
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr

    // Scale canvas context so coordinates match CSS pixels
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Handle window resize dynamically with debounce to avoid performance spikes
    let resizeTimer
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.canvas.width = this.width * dpr
        this.canvas.height = this.height * dpr
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }, 150)
    })
  }

  /**
   * Initializes stars in a 3D coordinate system.
   * x, y: horizontal/vertical offsets from the center
   * z: distance from camera, controls size and speed via perspective
   * radius: base star size, scaled by perspective
   * trail: stores previous projected points for the tapered tail effect
   */
  initStars() {
    const maxRadius = Math.max(this.width, this.height)
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * maxRadius,
        y: (Math.random() - 0.5) * maxRadius,
        z: Math.random() * this.width,
        radius: Math.random() * 1.5 + 0.5,
        trail: [] // Initially empty; will store projected points
      })
    }
  }

  /**
   * Main animation loop. Called recursively via requestAnimationFrame.
   * Handles star movement, perspective projection, trail drawing, and front circle rendering.
   */
  draw = () => {
    const ctx = this.ctx
    const centerX = this.width / 2
    const centerY = this.height / 2
    const maxRadius = Math.max(this.width, this.height) // cached to avoid repeated calls

    // Increment frame counter
    this.frameCounter++

    // Clear canvas with partial opacity to create a subtle motion blur / trail effect
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)' // slightly lighter for GPU optimization
    ctx.fillRect(0, 0, this.width, this.height)

    // Every 5 seconds at 60fps (~300 frames), fade remnants slightly more
    if (this.frameCounter % 300 === 0) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)' // slightly stronger fade
      ctx.fillRect(0, 0, this.width, this.height)
    }

    ctx.strokeStyle = '#fff' // Predefine stroke color to reuse
    ctx.globalAlpha = 1.0

    for (let s of this.stars) {
      // Move the star closer to the camera
      s.z -= this.speed

      // If star passes camera (z < 1), respawn it far away to continue the tunnel effect
      if (s.z < 1) {
        s.z = this.width + Math.random() * 200
        s.x = (Math.random() - 0.5) * maxRadius
        s.y = (Math.random() - 0.5) * maxRadius
        s.trail = [] // reset trail for new star
      }

      // Perspective projection: scale x and y by distance (z)
      const k = 500 / s.z // focal length approximation
      const px = s.x * k + centerX
      const py = s.y * k + centerY
      const headRadius = Math.max(s.radius * k * 0.3, 0.5) // circle at star front

      // Record new trail point (head = newest), reusing objects to reduce GC load
      if (s.trail.length < 8) {
        s.trail.push({ x: px, y: py })
      } else {
        const oldest = s.trail.shift()
        oldest.x = px
        oldest.y = py
        s.trail.push(oldest)
      }

      /**
       * Draw the trail behind the star:
       * - Thick at front (head) and taper toward back
       * - Fade out gradually for depth perception
       * - Points are drawn from newest (head) to oldest (tail)
       */
      for (let i = 0; i < s.trail.length - 1; i++) {
        const p1 = s.trail[i + 1] // newer point
        const p2 = s.trail[i] // older point

        const t = (i + 1) / s.trail.length // normalized position along trail (1=head)
        const lineWidth = headRadius * t // taper width
        const alpha = 0.5 * t // fade out gradually

        ctx.beginPath()
        ctx.globalAlpha = alpha
        ctx.lineWidth = lineWidth
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }

      // Reset alpha before drawing the star head
      ctx.globalAlpha = 1.0

      // Draw the star's front circle on top of the trail
      ctx.beginPath()
      ctx.arc(px, py, headRadius, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
    }

    // Request next animation frame for continuous animation
    requestAnimationFrame(this.draw)
  }
}

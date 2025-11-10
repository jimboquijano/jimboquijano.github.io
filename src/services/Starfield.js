/**
 * @file services/Starfield.js
 * @author Jimbo Quijano
 * @description Realistic 3D tunnel starfield animation with smooth trails and perspective.
 *
 * Stars appear as circles in front with trails tapering toward the back,
 * giving a dynamic 3D depth effect. Infinite trails create subtle texture.
 *
 */

export default class Starfield {
  /**
   * Initializes the Starfield animation.
   *
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

    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

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
        trail: []
      })
    }
  }

  /**
   * Main animation loop. Called recursively via requestAnimationFrame.
   * Handles star movement, perspective projection, trail drawing, and front circle rendering.
   */
  draw = () => {
    this.frameCounter++
    this.clearCanvas()
    for (let s of this.stars) this.updateStar(s)
    requestAnimationFrame(this.draw)
  }

  /**
   * Clears the canvas each frame with partial opacity to create
   * subtle motion blur / trailing effect.
   */
  clearCanvas() {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'
    ctx.fillRect(0, 0, this.width, this.height)

    // Every 5 seconds at 60fps (~300 frames), fade remnants slightly more
    if (this.frameCounter % 300 === 0) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)'
      ctx.fillRect(0, 0, this.width, this.height)
    }

    ctx.strokeStyle = '#fff'
    ctx.globalAlpha = 1.0
  }

  /**
   * Updates the star's position, projection, and
   * trail; then delegates to rendering methods.
   *
   * @param {Object} s - The star object.
   */
  updateStar(s) {
    const centerX = this.width / 2
    const centerY = this.height / 2
    const maxRadius = Math.max(this.width, this.height)

    // Move the star closer to the camera
    s.z -= this.speed

    // Respawn when it passes the camera
    if (s.z < 1) {
      s.z = this.width + Math.random() * 200
      s.x = (Math.random() - 0.5) * maxRadius
      s.y = (Math.random() - 0.5) * maxRadius
      s.trail = []
    }

    // Perspective projection
    const k = 500 / s.z
    const px = s.x * k + centerX
    const py = s.y * k + centerY
    const headRadius = Math.max(s.radius * k * 0.3, 0.5)

    // Update trail
    this.updateTrail(s, px, py)

    // Draw trail and head
    this.drawTrail(s, headRadius)
    this.drawHead(px, py, headRadius)
  }

  /**
   * Updates the trail points for a given star,
   * maintaining a fixed-length buffer of previous positions.
   */
  updateTrail(s, px, py) {
    if (s.trail.length < 8) {
      s.trail.push({ x: px, y: py })
    } else {
      const oldest = s.trail.shift()
      oldest.x = px
      oldest.y = py
      s.trail.push(oldest)
    }
  }

  /**
   * Draws the fading tapered trail behind each star.
   * - Fade out gradually for depth perception
   * - Points are drawn from newest (head) to oldest (tail)
   */
  drawTrail(s, headRadius) {
    const ctx = this.ctx

    for (let i = 0; i < s.trail.length - 1; i++) {
      const p1 = s.trail[i + 1]
      const p2 = s.trail[i]
      const t = (i + 1) / s.trail.length
      const lineWidth = headRadius * t
      const alpha = 0.5 * t

      ctx.beginPath()
      ctx.globalAlpha = alpha
      ctx.lineWidth = lineWidth
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }

    ctx.globalAlpha = 1.0
  }

  /**
   * Draws the bright front circle ("head") of each star.
   * - Thick at front (head) and taper toward back
   */
  drawHead(px, py, radius) {
    const ctx = this.ctx

    ctx.beginPath()
    ctx.arc(px, py, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
  }
}

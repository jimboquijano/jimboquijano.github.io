/**
 * @file Starstream.js
 * @author Jimbo Quijano
 * @description A lightweight and realistic 3D tunnel starstream animation with smooth trails and perspective.
 *
 * Stars appear as circles in front with trails tapering toward the back,
 * giving a dynamic 3D depth effect. Infinite trails create subtle texture.
 * Stars will now never spawn in a central "dead zone" defined by minRadius.
 */

export default class Starstream {
  /**
   * Initializes the starstream animation.
   *
   * @param {string} canvasId - The ID of the canvas element to render the starstream on.
   * @param {Object} config - Optional configuration object.
   * @param {number} config.numStars - Total number of stars to generate (default: 200).
   * @param {number} config.defaultSpeed - Speed of stars (default: 7).
   * @param {string} config.baseColor - Base fill color for canvas (default: '#000').
   * @param {string} config.starColor - Star trail and head color (default: '#fff').
   * @param {number} config.minRadius - Minimum screen radius from center for star spawn (default: 100).
   * @param {number} config.maxRadius - Maximum screen radius from center for star spawn (default: Math.max(width,height)).
   * @param {number} config.starRadius - Base radius for stars (default: 1).
   * @param {number} config.trailLength - Number of points in the star trail (default: 4).
   */
  constructor(canvasId, config = {}) {
    this.canvas = document.getElementById(canvasId)
    if (!this.canvas) throw new Error(`Canvas with id "${canvasId}" not found`)

    // Destructure config with defaults
    const {
      numStars = 200,
      defaultSpeed = 7,
      baseColor = '#000',
      starColor = '#fff',
      minRadius = 100,
      maxRadius = null,
      trailLength = 15,
      starRadius = 1
    } = config

    console.log(canvasId)

    this.ctx = this.canvas.getContext('2d')
    this.numStars = numStars
    this.defaultSpeed = defaultSpeed
    this.speed = this.defaultSpeed
    this.baseColor = baseColor
    this.starColor = starColor
    this.minRadius = minRadius
    this.trailLength = trailLength
    this.starRadius = starRadius
    this.stars = []

    // Screen dimensions
    this.width = window.innerWidth
    this.height = window.innerHeight

    // Compute maxRadius if not provided
    this.maxRadius = maxRadius || Math.max(this.width, this.height)

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

    // Set initial canvas size considering device pixel ratio
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let resizeTimer

    // Handle window resize to maintain correct canvas dimensions
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.canvas.width = this.width * dpr
        this.canvas.height = this.height * dpr
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }, 150) // debounce to prevent too many resizes
    })
  }

  /**
   * Initializes stars in a 3D coordinate system.
   * Ensures stars spawn outside the central dead zone.
   */
  initStars() {
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(this.spawnStar(this.maxRadius))
    }
  }

  /**
   * Main animation loop. Called recursively via requestAnimationFrame.
   * Handles star movement, perspective projection, trail drawing, and front circle rendering.
   */
  draw = () => {
    const ctx = this.ctx

    // Use precomputed RGBA colors for trailing effect
    ctx.fillStyle = this.baseColor
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.strokeStyle = this.starColor
    ctx.globalAlpha = 1.0

    for (let s of this.stars) this.updateStar(s)
    requestAnimationFrame(this.draw)
  }

  /**
   * Generates a single star outside the central dead zone.
   *
   * @param {number} maxRadius - Maximum x/y offset from center
   * @returns {Object} star object with x, y, z, radius, trail
   */
  spawnStar(maxRadius) {
    const centerX = this.width / 2
    const centerY = this.height / 2

    let x, y, z
    let px, py

    // Loop until the star is outside the central minimum radius
    do {
      x = (Math.random() - 0.5) * maxRadius // random offset X
      y = (Math.random() - 0.5) * maxRadius // random offset Y
      z = Math.random() * this.width // random Z (depth)
      const k = 500 / z // perspective scaling factor

      // Project 3D coordinates to 2D screen coordinates
      px = x * k + centerX
      py = y * k + centerY
    } while (Math.sqrt((px - centerX) ** 2 + (py - centerY) ** 2) < this.minRadius)

    // Use configurable starRadius
    return { x, y, z, radius: this.starRadius, trail: [] }
  }

  /**
   * Updates the star's position, projection, and trail; then delegates to rendering.
   *
   * @param {Object} s - The star object.
   */
  updateStar(s) {
    const centerX = this.width / 2
    const centerY = this.height / 2

    // Move the star closer to the camera
    s.z -= this.speed

    // Respawn when it passes the camera
    if (s.z < 1) Object.assign(s, this.spawnStar(this.maxRadius))

    // Perspective projection
    const k = 500 / s.z
    const px = s.x * k + centerX
    const py = s.y * k + centerY

    // Make head bigger for nearer stars
    const headRadius = Math.max(s.radius * k * 0.5, 1)

    // Opacity based on size
    const alpha = Math.min(k / 2, 1)

    // Update trail
    this.updateTrail(s, px, py)

    // Draw trail and head
    this.drawTrail(s, headRadius)
    this.drawHead(px, py, headRadius, alpha)
  }

  /**
   * Updates the trail points for a given star.
   * - Maintains a fixed-length buffer of previous positions
   * - Older points are shifted out to keep trail length consistent
   */
  updateTrail(s, px, py) {
    if (s.trail.length < this.trailLength) {
      // Fill trail initially
      s.trail.push({ x: px, y: py })
    } else {
      // Reuse oldest point to avoid creating new objects
      const oldest = s.trail.shift()
      oldest.x = px
      oldest.y = py
      s.trail.push(oldest)
    }
  }

  /**
   * Draws the fading tapered trail behind each star.
   * - Fade out gradually for depth perception
   * - Line thickness grows toward the head
   * - Draws points from newest (head) to oldest (tail)
   */
  drawTrail(s, headRadius) {
    const ctx = this.ctx

    for (let i = 0; i < s.trail.length - 1; i++) {
      const p1 = s.trail[i + 1] // newer point
      const p2 = s.trail[i] // older point
      const t = (i + 1) / s.trail.length
      const lineWidth = headRadius * t
      const alpha = 0.5 * t // fade effect

      ctx.beginPath()
      ctx.globalAlpha = alpha
      ctx.lineWidth = lineWidth
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }

    // Reset alpha for next draw
    ctx.globalAlpha = 1.0
  }

  /**
   * Draws the bright front circle ("head") of each star.
   * - Head is thick at the front and visually separates from trail
   */
  drawHead(px, py, radius, alpha = 1) {
    const ctx = this.ctx

    ctx.globalAlpha = alpha
    ctx.beginPath()

    ctx.arc(px, py, radius, 0, Math.PI * 2)
    ctx.fillStyle = this.starColor
    ctx.fill()
    ctx.globalAlpha = 1.0 // reset
  }
}

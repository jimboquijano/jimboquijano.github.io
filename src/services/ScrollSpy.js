/**
 * @file services/ScrollSpy.js
 * @author Jimbo Quijano
 * @description Handles dynamic navigation highlighting, smooth scrolling, and URL hash updates.
 *
 * ScrollSpy manages active state toggling for navigation links based on the current
 * scroll position, providing users with visual context of which section is in view.
 * It also enables smooth scrolling when clicking navigation links, updates the URL hash,
 * and supports optional offset (useful for fixed headers).
 */

export default class ScrollSpy {
  /**
   * Initializes the ScrollSpy.
   * @param {string} navSelector - CSS selector targeting navigation links.
   * @param {number} offset - Optional vertical offset (e.g., fixed header height).
   */
  constructor(navSelector, offset = 0) {
    this.navLinks = document.querySelectorAll(navSelector)
    this.sections = Array.from(this.navLinks).map((link) =>
      document.querySelector(link.getAttribute('href'))
    )
    this.offset = offset
    this.init()
  }

  /**
   * Initialize ScrollSpy by adding event listeners for click and scroll events.
   */
  init() {
    this.addClickListeners() // Smooth scrolling, URL updates, click activation
    this.addScrollListener() // Highlight nav based on scroll position
  }

  /**
   * Adds click listeners to navigation links.
   * Handles smooth scrolling, URL hash update, and prevents default jump-to behavior.
   */
  addClickListeners() {
    this.navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault() // Prevent default anchor behavior

        const targetId = link.getAttribute('href')
        const targetSection = document.querySelector(targetId)
        if (!targetSection) return

        // Scroll smoothly to the target section, adjusting for offset
        window.scrollTo({
          top: targetSection.offsetTop - this.offset,
          behavior: 'smooth'
        })

        // Update the URL hash without jumping
        history.pushState(null, '', targetId)
      })
    })
  }

  /**
   * Adds a scroll listener to highlight navigation links
   * based on the current viewport scroll position.
   */
  addScrollListener() {
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + this.offset

      this.sections.forEach((section, i) => {
        if (!section) return

        const top = section.offsetTop - this.offset
        const bottom = top + section.offsetHeight

        if (scrollPos >= top && scrollPos < bottom) {
          this.navLinks.forEach((l) => l.parentElement.classList.remove('active'))
          this.navLinks[i].parentElement.classList.add('active')
        }
      })
    })
  }
}

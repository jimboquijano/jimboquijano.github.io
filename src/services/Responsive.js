/**
 * @file services/Responsive.js
 * @author Jimbo Quijano
 * @description Handles dynamic repositioning of nav and footer based on viewport width.
 *
 * Moves the navigation to the top of #main and the footer to the bottom of #main
 * when the viewport width is below 1024px. Restores their original positions
 * above 1024px. Designed to be lightweight, responsive, and easy to integrate.
 */

export default class Responsive {
  /**
   * @param {Object} options - Configuration options for responsive navigation.
   * @param {string} options.navSelector - CSS selector for the navigation element.
   * @param {string} options.footerSelector - CSS selector for the footer element.
   * @param {string} options.mainSelector - CSS selector for the main container.
   * @param {number} [options.breakpoint=1024] - Viewport width threshold to reposition elements.
   */
  constructor({ navSelector, footerSelector, mainSelector, breakpoint = 1024 }) {
    this.nav = document.querySelector(navSelector)
    this.footer = document.querySelector(footerSelector)
    this.main = document.querySelector(mainSelector)
    this.breakpoint = breakpoint

    if (!this.nav || !this.footer || !this.main) {
      console.warn('ResponsiveNav: One or more elements not found')
      return
    }

    // Store original positions
    this.originalNavParent = this.nav.parentNode
    this.originalFooterParent = this.footer.parentNode
    this.navNextSibling = this.nav.nextElementSibling
    this.footerNextSibling = this.footer.nextElementSibling

    // Initialize
    this.repositionElements()
    window.addEventListener('resize', () => this.repositionElements())
  }

  /**
   * Repositions nav and footer based on viewport width.
   */
  repositionElements() {
    const viewportWidth = window.innerWidth

    if (viewportWidth < this.breakpoint) {
      // Move nav to top of main if not already there
      if (this.main.firstChild !== this.nav) {
        this.main.insertBefore(this.nav, this.main.firstChild)
      }

      // Move footer to bottom of main if not already there
      if (this.main.lastChild !== this.footer) {
        this.main.appendChild(this.footer)
      }
    } else {
      // Restore nav to original position safely
      if (this.originalNavParent) {
        if (this.navNextSibling && this.navNextSibling.parentNode === this.originalNavParent) {
          this.originalNavParent.insertBefore(this.nav, this.navNextSibling)
        } else {
          this.originalNavParent.appendChild(this.nav)
        }
      }

      // Restore footer to original position safely
      if (this.originalFooterParent) {
        if (
          this.footerNextSibling &&
          this.footerNextSibling.parentNode === this.originalFooterParent
        ) {
          this.originalFooterParent.insertBefore(this.footer, this.footerNextSibling)
        } else {
          this.originalFooterParent.appendChild(this.footer)
        }
      }
    }
  }
}

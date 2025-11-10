/**
 * @file services/FormModal.js
 * @author Jimbo Quijano
 * @description Handles opening, closing, and submitting a modal contact.
 *
 * The FormModal class provides an easy way to attach modal behavior to a form, including
 * opening via buttons, closing via X or outside clicks, and form submission handling.
 * Includes Formspree integration with loading state and dynamic success/error messages.
 */

export default class FormModal {
  /**
   * Initializes the modal functionality.
   * @param {Object} options - Configuration options for the modal.
   * @param {string} options.modalSelector - CSS selector for the modal container.
   * @param {string} options.openSelector - CSS selector for buttons that open the modal.
   * @param {string} options.closeSelector - CSS selector for the modal's close button.
   */
  constructor({ modalSelector, openSelector, closeSelector, formSelector }) {
    this.modal = document.querySelector(modalSelector)
    this.openButtons = document.querySelectorAll(openSelector)
    this.closeButton = document.querySelector(closeSelector)
    this.form = document.querySelector('form')

    if (!this.modal) throw new Error(`Modal element "${modalSelector}" not found`)
    if (!this.closeButton) throw new Error(`Close button "${closeSelector}" not found`)
    if (!this.form) throw new Error(`Form "${formSelector}" not found`)

    this.init()
  }

  /**
   * Initialize modal behavior: attach event listeners for opening, closing, and submitting.
   */
  init() {
    this.addOpenListeners()
    this.addCloseListeners()
    this.addFormListener()
  }

  /**
   * Adds click listeners to buttons to open the modal.
   */
  addOpenListeners() {
    this.openButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        this.modal.classList.add('active')
      })
    })
  }

  /**
   * Adds listeners to close the modal when clicking the close button
   * or clicking outside the modal content.
   */
  addCloseListeners() {
    this.closeButton.addEventListener('click', () => this.modal.classList.remove('active'))

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.modal.classList.remove('active')
    })
  }

  /**
   * Handles form submission inside the modal.
   * Uses Formspree via fetch() and provides a loading state and dynamic feedback.
   */
  addFormListener() {
    const submitBtn = this.form.querySelector('button[type="submit"]')
    const submitTxt = submitBtn.querySelector('span')
    const status = this.form.querySelector('.form-status')

    this.form.addEventListener('submit', async (e) => {
      e.preventDefault()

      // Disable button and show loading state
      submitBtn.disabled = true
      submitBtn.style.cursor = 'wait'
      submitTxt.textContent = 'Sending...'
      status.textContent = ''

      const data = new FormData(this.form)

      try {
        const response = await fetch(this.form.action, {
          method: this.form.method || 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        })

        if (response.ok) {
          status.textContent = '✅ Message sent successfully!'
          this.form.reset()
        } else {
          status.textContent = '❌ Failed to send message. Please try again.'
        }
      } catch (err) {
        status.textContent = '⚠️ Network error. Check your connection.'
      }

      // Restore button
      submitBtn.disabled = false
      submitBtn.style.cursor = 'pointer'
      submitTxt.textContent = 'Send Message'
    })
  }
}

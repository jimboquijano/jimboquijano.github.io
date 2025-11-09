/**
 * @file services/Modal.js
 * @description Handles opening, closing, and submitting a modal contact form using a configuration object for initialization.
 * @author Jimbo Quijano
 *
 * The Modal class provides an easy way to attach modal behavior to a form,
 * including opening via buttons, closing via X or outside clicks, and form submission handling.
 */

export default class Modal {
  /**
   * Initializes the modal functionality.
   * @param {Object} options - Configuration options for the modal.
   * @param {string} options.modalSelector - CSS selector for the modal container.
   * @param {string} options.openButtonSelector - CSS selector for buttons that open the modal.
   * @param {string} options.closeButtonSelector - CSS selector for the modal's close button.
   * @param {string} options.formSelector - CSS selector for the form inside the modal.
   */
  constructor({ modalSelector, openButtonSelector, closeButtonSelector, formSelector }) {
    this.modal = document.querySelector(modalSelector)
    this.openButtons = document.querySelectorAll(openButtonSelector)
    this.closeButton = document.querySelector(closeButtonSelector)
    this.form = document.querySelector(formSelector)

    if (!this.modal) throw new Error(`Modal element "${modalSelector}" not found`)
    if (!this.closeButton) throw new Error(`Close button "${closeButtonSelector}" not found`)
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
   * Currently shows an alert and resets the form; replace with real backend logic if needed.
   */
  addFormListener() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault()
      alert("Thanks for reaching out, I'll get back to you soon!")
      this.modal.classList.remove('active')
      this.form.reset()
    })
  }
}

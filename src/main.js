/**
 * @file main.js
 * @description Entry point for the portfolio site.
 * @author Jimbo Quijano
 *
 * Initializes starfield, scroll spy, responsive navigation,
 * and modal form. Handles loader visibility on page load.
 */

import ScrollSpy from './services/ScrollSpy'
import Starfield from './services/Starfield'
import Responsive from './services/Responsive'
import FormModal from './services/FormModal'
import './style.scss'

document.addEventListener('DOMContentLoaded', () => {
  new ScrollSpy('.navs a', 0)
  new Starfield('starfield-bg', 200)

  new Responsive({
    navSelector: 'nav.navs',
    footerSelector: 'footer',
    mainSelector: '#main',
    breakpoint: 1024
  })

  new FormModal({
    modalSelector: '#contactModal',
    openSelector: ".button[href='#']",
    closeSelector: '#closeModal'
  })

  // Add click behavior to wrappers with links
  document.querySelectorAll('.with-link').forEach((wrapper) => {
    wrapper.addEventListener('click', () => {
      const link = wrapper.querySelector('.link')
      if (!link) return

      const href = link.getAttribute('data-href')
      const target = link.getAttribute('data-target') || '_self'
      if (href) window.open(href, target)
    })
  })
})

// Loader handling
const loader = document.getElementById('loader')
const container = document.querySelector('.container')

if (loader && container) {
  loader.style.display = 'none'
  container.style.display = 'block'
}

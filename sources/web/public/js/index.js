const header = document.querySelector('[data-header]')
const menuButton = document.querySelector('[data-menu-toggle]')
const navigation = document.querySelector('[data-navigation]')

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 12)

const closeMenu = () => {
    navigation?.classList.remove('open')
    menuButton?.setAttribute('aria-expanded', 'false')
    menuButton?.setAttribute('aria-label', 'Abrir menú')
    document.body.classList.remove('menu-open')
}

menuButton?.addEventListener('click', () => {
    const isOpen = navigation?.classList.toggle('open') ?? false
    menuButton.setAttribute('aria-expanded', String(isOpen))
    menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú')
    document.body.classList.toggle('menu-open', isOpen)
})

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !navigation?.classList.contains('open')) return
    closeMenu()
    menuButton?.focus()
})

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))
window.addEventListener('scroll', updateHeader, { passive: true })
updateHeader()

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
    })
}, { threshold: .12 })

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))

// Con «reducir movimiento» el video queda en su imagen fija.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const syncMotion = () => document.querySelectorAll('video[data-motion]').forEach((video) => {
    if (reducedMotion.matches) video.pause()
    else video.play().catch(() => {})
})
reducedMotion.addEventListener('change', syncMotion)
syncMotion()

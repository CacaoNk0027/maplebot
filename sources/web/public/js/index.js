const header = document.querySelector('[data-header]')
const menuButton = document.querySelector('[data-menu-toggle]')
const navigation = document.querySelector('[data-navigation]')
const year = document.querySelector('[data-year]')

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 12)

const closeMenu = () => {
    navigation?.classList.remove('open')
    menuButton?.setAttribute('aria-expanded', 'false')
    document.body.classList.remove('menu-open')
}

menuButton?.addEventListener('click', () => {
    const isOpen = navigation?.classList.toggle('open') ?? false
    menuButton.setAttribute('aria-expanded', String(isOpen))
    document.body.classList.toggle('menu-open', isOpen)
})

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))
window.addEventListener('scroll', updateHeader, { passive: true })
updateHeader()

if (year) year.textContent = String(new Date().getFullYear())

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
    })
}, { threshold: .12 })

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))

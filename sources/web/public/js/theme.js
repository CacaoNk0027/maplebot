// Selector de tema: Sistema → Claro → Oscuro. «Sistema» borra la elección y
// vuelve a prefers-color-scheme. El script del <head> (views/partials/theme-head.html)
// aplica la elección guardada antes de pintar; este solo la cambia.

const KEY = 'tema'
const ORDER = ['system', 'light', 'dark']
const root = document.documentElement
const toggles = [...document.querySelectorAll('[data-theme-toggle]')]
const metas = [...document.querySelectorAll('meta[name="theme-color"][data-scheme]')]

const read = () => {
    try {
        const value = localStorage.getItem(KEY)
        return value === 'light' || value === 'dark' ? value : 'system'
    } catch {
        return 'system'
    }
}

const save = (state) => {
    try {
        if (state === 'system') localStorage.removeItem(KEY)
        else localStorage.setItem(KEY, state)
    } catch { }
}

const apply = (state) => {
    if (state === 'system') delete root.dataset.theme
    else root.dataset.theme = state

    // La barra del navegador acompaña al tema elegido, no solo al del sistema.
    for (const meta of metas) {
        meta.media = state === 'system'
            ? `(prefers-color-scheme: ${meta.dataset.scheme})`
            : meta.dataset.scheme === state ? 'all' : 'not all'
    }

    for (const toggle of toggles) {
        const next = ORDER[(ORDER.indexOf(state) + 1) % ORDER.length]
        const name = (key) => toggle.dataset[`name${key[0].toUpperCase()}${key.slice(1)}`]
        toggle.dataset.state = state
        const label = `${toggle.dataset.label}: ${name(state)}. ${toggle.dataset.next} ${name(next)}`
        toggle.setAttribute('aria-label', label)
        toggle.title = label
    }
}

let current = read()
apply(current)

const status = document.querySelector('[data-theme-status]')

for (const toggle of toggles) {
    toggle.addEventListener('click', () => {
        current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]
        save(current)
        apply(current)
        // Solo al pulsar: al cargar la página no hay nada que anunciar.
        if (status) {
            const key = current[0].toUpperCase() + current.slice(1)
            status.textContent = `${toggle.dataset.label}: ${toggle.dataset[`name${key}`]}`
        }
    })
}

// Otra pestaña cambió el tema: esta la sigue.
window.addEventListener('storage', (event) => {
    if (event.key !== KEY && event.key !== null) return
    current = read()
    apply(current)
})

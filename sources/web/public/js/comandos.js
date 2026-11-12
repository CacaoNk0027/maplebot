// Búsqueda de la documentación de comandos. Sin JavaScript la página muestra
// todos los comandos y el buscador queda oculto, así que nada depende de esto.

const search = document.querySelector('[data-search]')
const input = document.querySelector('[data-search-input]')
const empty = document.querySelector('[data-search-empty]')
const commands = [...document.querySelectorAll('[data-command]')]
const categories = [...document.querySelectorAll('[data-category]')]

if (search && input) {
    search.hidden = false

    const filter = () => {
        const query = input.value.trim().toLowerCase()
        let visible = 0
        for (const command of commands) {
            const match = !query || command.dataset.terms.split(' ').some(term => term.includes(query))
            command.hidden = !match
            if (match) visible++
        }
        for (const category of categories) {
            category.hidden = !category.querySelector('[data-command]:not([hidden])')
        }
        // La región es fija y solo cambia su texto, para que los lectores de
        // pantalla la anuncien.
        if (empty) empty.textContent = visible > 0 ? '' : empty.dataset.emptyText

        // La búsqueda queda en la URL para poder compartirla, sin llenar el historial.
        const url = new URL(location.href)
        if (query) url.searchParams.set('q', input.value.trim())
        else url.searchParams.delete('q')
        history.replaceState(null, '', url)
    }

    input.addEventListener('input', filter)

    const initial = new URLSearchParams(location.search).get('q')
    if (initial) {
        input.value = initial
        filter()
    }
}

// Un enlace a un comando concreto (/comandos#cmd-ban) lo abre, tanto al cargar
// como al pulsarlo dentro de la página.
const openFromHash = () => {
    if (!location.hash.startsWith('#cmd-')) return
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
    if (target instanceof HTMLDetailsElement) target.open = true
}
window.addEventListener('hashchange', openFromHash)
openFromHash()

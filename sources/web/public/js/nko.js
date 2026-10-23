const TOKEN_VISIBLE_MS = 30_000

async function postJson(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: body ? JSON.stringify(body) : undefined
    })
    // El limitador de peticiones y los errores del proxy no siempre devuelven JSON.
    const data = await response.json().catch(() => ({}))
    return { ok: response.ok, data }
}

function setStatus(form, message, state) {
    const status = form.querySelector('[data-status]')
    if (!status) return
    status.textContent = message
    status.dataset.state = state
}

const value = (form, name) => form.elements.namedItem(name).value

let hideTokenTimer

function showToken(token) {
    const output = document.querySelector('[data-token-output]')
    const code = document.querySelector('[data-token-value]')
    code.textContent = token
    output.hidden = false

    clearTimeout(hideTokenTimer)
    hideTokenTimer = setTimeout(() => {
        code.textContent = ''
        output.hidden = true
    }, TOKEN_VISIBLE_MS)
}

// Cada formulario declara su acción con data-api-form; aquí vive qué envía y qué hace al terminar.
const actions = {
    login: {
        url: '/api/login',
        body: (form) => ({ username: value(form, 'username'), password: value(form, 'password') }),
        done: (data) => location.assign(data.redirect || '/api/dashboard')
    },
    register: {
        url: '/api/register',
        body: (form) => ({ username: value(form, 'username'), password: value(form, 'password') }),
        done: (data) => location.assign(data.redirect || '/api/dashboard')
    },
    token: {
        url: '/api/tokens',
        body: (form) => ({ password: value(form, 'password') }),
        done: (data, form) => {
            showToken(data.data.token)
            document.querySelector('[data-token-state]').textContent =
                'Tienes un token activo. Si lo perdiste, genera otro: el anterior dejará de funcionar al instante.'
            document.querySelector('[data-token-button]').textContent = 'Regenerar token'
            form.reset()
            return 'Token generado.'
        }
    },
    chgname: {
        url: '/api/dashboard/chgname',
        body: (form) => ({ newUsername: value(form, 'username'), password: value(form, 'password') }),
        done: (data, form, body) => {
            document.querySelectorAll('[data-username]').forEach((element) => {
                element.textContent = body.newUsername
            })
            form.reset()
            return data.message
        }
    },
    chgpass: {
        url: '/api/dashboard/chgpass',
        body: (form) => ({ oldPassword: value(form, 'oldPassword'), newPassword: value(form, 'newPassword') }),
        done: async (_data, form) => {
            setStatus(form, 'Contraseña cambiada. Cerrando tu sesión…', 'success')
            await postJson('/api/logout').catch(() => {})
            location.assign('/api/login')
        }
    },
    delete: {
        url: '/api/delacc',
        body: (form) => ({ password: value(form, 'password') }),
        done: () => location.assign('/api')
    }
}

document.querySelectorAll('form[data-api-form]').forEach((form) => {
    const action = actions[form.dataset.apiForm]
    const button = form.querySelector('button[type="submit"]')

    form.addEventListener('submit', async (event) => {
        event.preventDefault()

        const invalid = form.querySelector(':invalid')
        if (invalid) {
            setStatus(form, invalid.validationMessage, 'error')
            invalid.focus()
            return
        }

        const label = button.textContent
        button.disabled = true
        button.textContent = button.dataset.busy || label
        setStatus(form, '', '')

        try {
            const body = action.body(form)
            const { ok, data } = await postJson(action.url, body)
            if (!ok) {
                setStatus(form, data.message || 'No se pudo completar. Inténtalo de nuevo.', 'error')
                return
            }
            const message = await action.done(data, form, body)
            if (message) setStatus(form, message, 'success')
        } catch (error) {
            console.error(error)
            setStatus(form, 'No hay conexión con el servidor. Inténtalo de nuevo.', 'error')
        } finally {
            // El botón de token cambia su texto en done(); no se pisa con el anterior.
            if (button.textContent === button.dataset.busy) button.textContent = label
            button.disabled = false
        }
    })
})

document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', async () => {
        button.disabled = true
        try {
            await postJson('/api/logout')
        } finally {
            location.assign('/api')
        }
    })
})

document.querySelectorAll('[data-copy]').forEach((button) => {
    const label = button.textContent
    button.addEventListener('click', async () => {
        const text = document.querySelector(button.dataset.copy)?.textContent ?? ''
        try {
            await navigator.clipboard.writeText(text)
            button.textContent = 'Copiado'
        } catch {
            button.textContent = 'No se pudo copiar'
        }
        setTimeout(() => { button.textContent = label }, 2000)
    })
})

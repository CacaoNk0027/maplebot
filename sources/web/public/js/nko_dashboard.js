document.addEventListener('DOMContentLoaded', () => {
    const cambiarUsuario = document.getElementById('cambiarUsuario')

    cambiarUsuario.addEventListener('submit', async (event) => {
        event.preventDefault()

        let username = document.getElementById('username').value
        let password = document.getElementById('password').value

        try {
            let response = await fetch('/api/dashboard/chgname', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newUsername: username, password })
            })

            let data = await response.json()

            if (response.ok) {
                alert(data.message)
                window.location.reload()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error(error)
            alert('error al cambiar de usuario')
        }
    })

    const cambiarContra = document.getElementById('cambiarContra')

    cambiarContra.addEventListener('submit', async (event) => {
        event.preventDefault()

        let newPassword = document.getElementById('newPassword').value
        let oldPassword = document.getElementById('oldPassword').value

        try {
            let response = await fetch('/api/dashboard/chgpass', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword
                })
            })

            let data = await response.json()
            if (response.ok) {
                alert(data.message + ' vuelve a iniciar sesion')
                window.location.reload()
                logOut()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error(error)
            alert('error al cambiar la contraseña')
        }

    })
})

const tokenDisplay = document.getElementById('token-display')
const generateTokenButton = document.getElementById('generate-token')
let hideTokenTimeout

function hideToken() {
    tokenDisplay.textContent = '********'
    hideTokenTimeout = undefined
}

generateTokenButton.addEventListener('click', async () => {
    let password = prompt('Ingresa tu contraseña para generar un token. Si ya tienes uno, sera reemplazado.')
    if (!password) return alert('no se puede generar un token sin la contraseña')

    try {
        let response = await fetch('/api/tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        })

        let data = await response.json()
        if (response.ok) {
            if (hideTokenTimeout) clearTimeout(hideTokenTimeout)

            tokenDisplay.textContent = data.data.token
            hideTokenTimeout = setTimeout(hideToken, 30_000)
            generateTokenButton.textContent = 'Regenerar token'
            alert('Token generado. Copialo ahora: se ocultara en 30 segundos y no podra volver a mostrarse.')
        } else {
            alert(data.message)
        }
    } catch (error) {
        console.error(error)
        alert('Error al generar el token.')
    }
})

document.getElementById('eliminarCuenta').addEventListener('submit', async (event) => {
    event.preventDefault()
    
    let password = document.getElementById('reqPassword').value

    try {
        let response = await fetch('/api/delacc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        })

        let data = await response.json()
        if (response.ok) {
            alert(data.message)
            window.location.href = '/'
        } else {
            alert(data.message)
        }
    } catch (error) {
        console.error(error)
        alert('Error al eliminar la cuenta.')
    }
})

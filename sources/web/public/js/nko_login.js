document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault()

    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })

    const result = await response.json()
    alert(result.message)

    if (response.status === 200) {
        window.location.href = result.redirect
    }
})
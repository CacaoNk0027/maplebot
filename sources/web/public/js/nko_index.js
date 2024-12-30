async function logOut() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });
        if (response.ok) {
            window.location = '/api';
        } else {
            console.error('Error al cerrar sesión');
        }
    } catch (error) {
        console.error('Error al cerrar sesión', error);
    }
}
function toggleMenu() {
    let header = document.getElementById('head')
    header.classList.toggle('despleg')
}
import express from 'express'

const router = express.Router()

router.post('/', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.error(err)
            return res.status(500).json({ 
                message: 'Error al cerrar sesión',
                code: res.statusCode
            })
        }
        res.clearCookie('connect.sid')
        res.status(200).json({ message: 'Cierre de sesión exitoso' })
    })
})

export default router
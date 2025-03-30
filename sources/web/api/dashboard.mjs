import Token from "../models/token.mjs"
import User from "../models/user.mjs"
import express from 'express'

const router = express.Router()

router.get('/', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: 'No autorizado',
            code: res.statusCode
        })
    }

    let user = await User.findById(req.session.userId)
    let token = await Token.findOne({ userId: req.session.userId })

    res.render('api/dashboard.html', {
        currentName: user.username,
        hasToken: !!token
    })
})

router.post('/chgname', async (req, res) => {
    let { newUsername, password } = req.body
    let userId = req.session.userId

    if (!userId) return res.status(401).json({
        message: 'No autenticado',
        code: res.statusCode
    })

    const usernameRegex = /^[A-Za-z0-9_-]{1,30}$/
    if (!usernameRegex.test(newUsername)) return res.status(400).json({
        message: 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos, y debe tener un máximo de 30 caracteres.',
        code: res.statusCode
    })

    try {

        let user = await User.findById(userId)
        if (!user) return res.status(404).json({
            message: 'Usuario no encontrado',
            code: res.statusCode
        })

        let match = await user.comparePassword(password)
        if (!match) return res.status(400).json({
            message: 'Contraseña incorrecta',
            code: res.statusCode
        })

        if(user.username === newUsername) return res.status(400).json({
            message: 'nombre de usuario identico al actual'
        })

        user.username = newUsername
        await user.save()

        res.status(200).json({
            message: 'Usuario cambiado correctamente',
            code: res.statusCode
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Error de servidor',
            code: res.statusCode
        })
    }
})

router.post('/chgpass', async (req, res) => {
    let { oldPassword, newPassword } = req.body
    let userId = req.session.userId

    if (!userId) return res.status(401).json({
        message: 'No autenticado',
        code: res.statusCode
    })

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/
    if (!passwordRegex.test(newPassword)) return res.status(400).json({
        message: 'La contraseña nueva debe tener al menos 8 caracteres, contener letras, números y caracteres especiales.',
        code: res.statusCode
    })

    try {
        let user = await User.findById(userId)
        
        if (!user) return res.status(404).json({
            message: 'Usuario no encontrado',
            code: res.statusCode
        })

        let match = await user.comparePassword(oldPassword)
        if (!match) return res.status(400).json({
            message: 'Contraseña incorrecta',
            code: res.statusCode
        })

        if(newPassword === oldPassword) return res.status(400).json({
            message: 'contraseña identica a la actual'
        })

        user.password = newPassword
        await user.save()

        res.status(200).json({
            message: 'Contraseña cambiada',
            code: res.statusCode
        })

    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Error de servidor',
            code: res.statusCode
        })
    }
})

export default router
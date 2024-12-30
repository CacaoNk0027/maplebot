import express from 'express'
import User from '../models/user.mjs'

const router = express.Router()

router.get('/', (req, res) => {
    res.render('api/register.html')
})

router.post('/', async (req, res) => {
    let { username, password } = req.body

    const usernameRegex = /^[A-Za-z0-9_-]{1,30}$/;
    if (!usernameRegex.test(username)) return res.status(400).json({
        message: 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos, y debe tener un máximo de 30 caracteres.',
        code: res.statusCode
    });

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) return res.status(400).json({
        message: 'La contraseña debe tener al menos 8 caracteres, contener letras, números y caracteres especiales.',
        code: res.statusCode
    });

    try {
        let user = await User.findOne({ username })
        if (user) return res.status(400).json({
            message: "Usuario ya registrado",
            code: res.statusCode
        })

        user = new User({ username, password });
        await user.save();

        req.session.userId = user._id

        res.status(201).json({
            message: 'Usuario registrado correctamente',
            code: res.statusCode,
            redirect: '/api'
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
import Token from "../models/token.mjs";
import User from "../models/user.mjs";
import crypto from 'crypto'
import express from 'express'

const router = express.Router()

router.post('/', async (req, res) => {
    let { password } = req.body

    let userId = req.session.userId
    if(!userId) return res.status(401).json({
        message: "No autorizado",
        code: res.statusCode,
        data: {}
    })

    let user = await User.findById(userId);

    let match = await user.comparePassword(password)
    if (!match) return res.status(400).json({
        message: 'Contraseña incorrecta',
        code: res.statusCode,
        data: {}
    })

    let token = crypto.randomBytes(32).toString('base64')
    let newToken = new Token({ userId, token })

    try {
        await Token.deleteMany({ userId })
        await newToken.save()
        res.status(201).json({
            message: "token generado correctamente",
            code: res.statusCode, 
            data: {
                token
            }
        })
    } catch(error) {
        console.error(error)
        res.status(500).json({
            message: "Error interno del servidor",
            code: res.statusCode,
            data: {}
        })
    }
})

router.post('/reveal', async (req, res) => {
    let { password } = req.body

    let userId = req.session.userId
    if(!userId) return res.status(401).json({
        message: "No autorizado",
        code: res.statusCode,
        data: {}
    })

    let user = await User.findById(userId);

    let match = await user.comparePassword(password)
    if (!match) return res.status(400).json({
        message: 'Contraseña incorrecta',
        code: res.statusCode,
        data: {}
    })

    try {
        let token = await Token.findOne({ userId });
        res.status(200).json({
            message: "token enviado",
            code: res.statusCode, 
            data: {
                token: token.token
            }
        })
    } catch(error) {
        console.error(error)
        res.status(500).json({
            message: "Error interno del servidor",
            code: res.statusCode,
            data: {}
        })
    }
})

export default router
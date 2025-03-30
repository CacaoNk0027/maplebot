import auth from '../../middlewares/authorization.mjs'
import express from "express"
import Action from '../../models/action.mjs'
import Reaction from '../../models/reaction.mjs'

const router = express.Router()

router.get('/', auth, async (req, res) => {
    res.status(200).json({
        message: "Acceso a SFW",
        code: res.statusCode,
        data: {
            action: '/api/sfw/action',
            reaction: '/api/sfw/reaction'
        }
    })
})

router.get('/action', auth, async(req, res) => {
    res.status(200).json({
        message: "Categoria de acción",
        code: res.statusCode,
        data: await Action.findOne({})
    })
})

router.get('/action/:category', auth, async (req, res) => {
    try {
        let { category } = req.params
        let { random } = req.query

        const docto = await Action.findOne({}, { [category]: 1 })

        if (!docto?.[category]) {
            return res.status(404).json({
                message: `Recurso no encontrado >> Categoria desconocida`,
                code: res.statusCode,
                data: {}
            })
        }

        const gifs = docto[category]

        if(!random || random != 'true') {
            return res.status(200).json({
                message: `ok >> ${category} gif`,
                code: res.statusCode,
                data: gifs
            })
        }

        return res.status(200).json({
            message: `ok >> ${category} gif`,
            code: res.statusCode,
            data: gifs[Math.floor(Math.random() * gifs.length)]
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error de servidor', code: res.statusCode })
    }
})

router.get('/reaction', auth, async(req, res) => {
    res.status(200).json({
        message: "Categoria de reacción",
        code: res.statusCode,
        data: await Reaction.findOne({})
    })
})

router.get('/reaction/:category', auth, async (req, res) => {
    try {
        let { category } = req.params
        let { random } = req.query

        const docto = await Reaction.findOne({}, { [category]: 1 })

        if (!docto?.[category]) {
            return res.status(404).json({
                message: `Recurso no encontrado >> Categoria desconocida`,
                code: res.statusCode,
                data: {}
            })
        }

        const gifs = docto[category]

        if(!random || random != 'true') {
            return res.status(200).json({
                message: `ok >> ${category} gif`,
                code: res.statusCode,
                data: gifs
            })
        }

        return res.status(200).json({
            message: `ok >> ${category} gif`,
            code: res.statusCode,
            data: gifs[Math.floor(Math.random() * gifs.length)]
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error de servidor', code: res.statusCode })
    }
})

export default router
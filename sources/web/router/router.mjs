import express from 'express'

import api from '../api/api.mjs'

const router = express.Router()

router.use('/api', api)

router.get('/', async (req, res) => {
    res.render('index.html')
})

export default router
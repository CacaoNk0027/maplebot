import express from 'express'

import api from '../api/api.mjs'

const router = express.Router()

router.use('/api', api)

router.get('/', async (req, res) => {
    res.render('index.html')
})

router.get('/kmzkuro', async (req, res) => {
    res.render('kmzkuro.html')
})

export default router
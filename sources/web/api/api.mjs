import express from 'express'
import register from './register.mjs'
import dashboard from './dashboard.mjs'
import logout from './logout.mjs'
import tokens from './token.mjs'
import login from './login.mjs'
import sfw from './categorias/sfw.mjs'

const router = express.Router()

router.use('/dashboard', dashboard)
router.use('/register', register)
router.use('/tokens', tokens)
router.use('/logout', logout)
router.use('/login', login)
router.use('/sfw', sfw)

router.get('/', (req, res) => {
    let isLoggedIn = req.session.userId ? true : false
    res.render('api/index.html', { isLoggedIn })
})

export default router
import express from 'express'
import cors from 'cors'
import ejs from 'ejs'
import router from './router/router.mjs'
import sessions from './middlewares/sessions.mjs'

const app = express()

function main() {

    app.set('port', process.env.PORT || 449)

    app.set('json spaces', 2)
    app.set('views', 'sources/web/views')
    app.set('view engine', 'ejs')

    app.engine('html', ejs.renderFile)

    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())
    app.use(cors())

    sessions(app);
    
    app.use(router)
    app.use('/', express.static('sources/web/public'))

    app.get('*', (req, res) => {
        res.status(404).send('recurso no encontrado');
    })

    app.listen(app.get('port'), () => {
        console.info('servidor web arrancado')
    })
}

// exports

export default main
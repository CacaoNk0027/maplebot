import express from 'express'

function main() {

    const app = express()
    
    app.set('port', process.env.PORT || 449)
    
    app.get('/', (req, res) => {
        res.send('hola mundo')
    })

    app.listen(app.get('port'), () => {
        console.info('servidor web arrancado')
    })
}

// exports

export default main
import MongoStore from 'connect-mongo'
import session from 'express-session'
import ms from 'ms'

function sessions(app) {
    app.use(session({
        secret: process.env.SESSION,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ 
            mongoUrl: process.env.URI_DBNEEKURO,
            collectionName: "websessions" 
        }),
        cookie: {
            maxAge: ms('2h')
        }
    }))
}

export default sessions
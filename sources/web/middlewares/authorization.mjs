import token from "../models/token.mjs"

async function auth_token(req, res, next) {
    let auth = req.headers['authorization']

    if (!auth) {
        res.status(401).json({ message: 'No autorizado', code: res.statusCode })
        return 1
    }

    try {
        let query = await token.findOne({ token: auth })

        if(!query) {
            res.status(403).json({ message: 'No autorizado', code: res.statusCode })
            return 1
        }

        next()
    } catch(error) {
        console.error(error)
        res.status(500).json({ message: 'Error de servidor', code: res.statusCode })
        return 1
    }
}

export default auth_token
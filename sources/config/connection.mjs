import mongoose from 'mongoose'

async function connect() {
    try {
        await mongoose.connect(process.env.URI)        
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

export default connect
import mongoose from "mongoose"
import bcrypt from 'bcryptjs'

const user = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

user.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password)
}

user.pre('save', async function(next) {
    if (!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

export default mongoose.model('WebUser', user)
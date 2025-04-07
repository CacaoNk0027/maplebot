import mongoose from "mongoose"
import hex from 'hex-color-regex'

const welcomeSchema = new mongoose.Schema({
    guildId: {
        type: String,
        unique: true,
        required: true
    },
    isEmbed: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: null,
        maxlength: 40
    },
    description: {
        type: String,
        default: null,
        maxlength: 60
    },
    message: {
        type: String,
        default: null,
        maxlength: 400
    },
    background: {
        type: {
            type: String,
            enum: ['color', 'image'],
            default: 'color'
        },
        value: {
            type: String,
            default: '#1a1d1f'
        }
    },
    colors: {
        title: {
            type: String,
            default: '#FFFFFF',
            validate: {
                validator: v => hex({strict: true}).test(v),
                message: prop => `${prop.value} no es un color valido`
            }
        },
        description: {
            type: String,
            default: '#99AAB5',
            validate: {
                validator: v => hex({strict: true}).test(v),
                message: prop => `${prop.value} no es un color valido`
            }
        },
        border: {
            type: String,
            default: '#7289DA',
            validate: {
                validator: v => hex({strict: true}).test(v),
                message: prop => `${prop.value} no es un color valido`
            }
        }
    }
})

const Welcome = mongoose.model('Welcomes', welcomeSchema)

export default Welcome
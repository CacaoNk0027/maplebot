"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_schema = new mongoose_1.default.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    level: {
        type: Number,
        default: 1,
        min: 1
    },
    exp: {
        current: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        max: {
            type: Number,
            required: true,
            default: 100,
            min: 100
        }
    }
}, {
    statics: {
        getUser: async function (id) {
            let user = await this.findOne({ id });
            if (!user) {
                user = await this.create({ id });
            }
            return user;
        },
        updateLevel: async function (userId) {
            try {
                let user = await this.findOne({ id: userId });
                if (!user) {
                    user = await this.create({ id: userId });
                }
                if (!user.exp) {
                    user.exp = { current: 0, max: 100 };
                }
                user.exp.current = (user.exp.current ?? 0) + random_exp(20, 2);
                while (user.exp.current >= user.exp.max) {
                    user.level += 1;
                    user.exp.max = nex_level_exp(user.level);
                    user.exp.current = 0;
                }
                await user.save();
            }
            catch (error) {
            }
        }
    },
    methods: {
        getLevelInfo: function () {
            return {
                level: this.level,
                current_exp: this.exp?.current,
                max_exp: this.exp?.max
            };
        }
    }
});
function nex_level_exp(level) {
    let sum = 0;
    for (let i = 5; i <= level; i++) {
        sum += i / 4 * Math.pow(2, 6);
    }
    return 100 + sum;
}
function random_exp(rank, divisor) {
    let result;
    result = Math.floor(Math.random() * rank);
    if (result % divisor == 0) {
        return result;
    }
    else {
        return 0;
    }
}
const User = mongoose_1.default.model('User', user_schema);
exports.default = User;

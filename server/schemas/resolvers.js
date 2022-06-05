const { User } = require('../models')
const { signToken } = require('../utils/auth')
const { AuthenticationError, RenameTypes } = require('apollo-server-express')

const resolvers = {
    Query: {
        user: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne( {_id: context.user._id})
                .select('-__v -password')
                .populate('savedBooks')
                
                return userData
            }
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)
            return { user, token }
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email })
            if (!user) {
                throw new AuthenticationError('Wrong Login Credentials')
            }
            const correctPw = await user.isCorrectPassword(password)
            if(!correctPw) {
                throw new AuthenticationError('Wrong Login Credentials')
            }
            const token = signToken(user)
            return { user, token }
        }
    }
}

module.exports = resolvers
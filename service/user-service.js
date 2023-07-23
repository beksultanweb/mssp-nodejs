const UserModel = require('../models/user-model')
const bcrypt = require('bcryptjs')
const uuid = require('uuid')
const sendActivationMail = require('./mail-service')
const sendResetPassEmail = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')
const tokenModel = require('../models/token-model')

class UserService {
    async registration(email, password, firstName, secondName) {
        if(!email || !password) throw ApiError.BadRequest('Email и пароль обязательны для заполнения')
        const candidate = await UserModel.findOne({email})
        if(candidate) {
            throw ApiError.BadRequest('Пользователь с таким почтовым адресом уже существует')
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()

        const user = await UserModel.create({email, password: hashPassword, roles: { "User": 2001 }, firstName, secondName, activationLink})
        await sendActivationMail(email, `${process.env.CLIENT_URL}/api/activate/${activationLink}`)

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto
        }
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if(!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        user.isActivated = true
        await user.save()
    }

    async resetpassword(email) {
        const user = await UserModel.findOne({ email: email })
        if (!user) throw ApiError.BadRequest("user with given email doesn't exist")
        const token = await tokenModel.findOne({user: user._id})
        if (!token) {
            const userDto = new UserDto(user)
            tokens = tokenService.generateTokens({...userDto})
            await tokenService.saveToken(userDto.id, tokens.refreshToken)
            return {
                ...tokens,
                user: userDto
            }
        }
        const link = `${process.env.CLIENT_URL}/password-reset/${user._id}/${token.refreshToken}`
        console.log(link)
        await sendResetPassEmail(user.email, link)
    }

    async setnewpassword(userId, password, refreshToken) {
        const user = await UserModel.findById(userId)
        if (!user) throw ApiError.BadRequest("invalid link or expired")

        const token = await tokenService.findOne({
            user: user._id,
            refreshToken: refreshToken,
        });
        if (!token) throw ApiError.BadRequest("invalid link or expired")

        user.password = password
        await user.save()
        await token.delete();
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if(!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if(!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken) {
        if(!refreshToken) {
            throw ApiError.UnauthorizedError()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if(!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError()
        }
        const user = await UserModel.findById(userData.id)

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async getUserInfo(userId) {
        const user = await UserModel.findById(userId)
        return user
    }
}

module.exports = new UserService()
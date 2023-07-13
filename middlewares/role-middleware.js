const jwt = require('jsonwebtoken')

const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(403).json({message: "Пользователь не авторизован"})
            }
            const {roles: userRoles} = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            const rolesArray = [...allowedRoles]

            const result = userRoles.map(role => rolesArray.includes(role)).find(val => val === true)
            if(!result) return res.status(401).json({message: 'У вас нет доступа'})
            next()
        } catch (error) {
            return res.status(403).json({message: "Пользователь не авторизован"})
        }
    }
}

module.exports = verifyRoles
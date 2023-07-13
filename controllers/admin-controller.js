const RequestService = require('../service/requests-service')
const UserService = require('../service/user-service')
const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/api-error')
const path = require('path')

class AdminController {
    async getAllRequests(req, res, next) {
        try {
            const requests = await RequestService.getAllRequests()
            return res.json(requests)
        } catch (error) {
            next(error)
        }
    }
    async getUser(req, res, next) {
        try {
            const userId = req.params.userId
            const user = await UserService.getUserInfo(userId)
            return res.json(user)
        } catch (error) {
            next(error)
        }
    }
    async updateStatus(req, res, next) {
        try {
            const requestId = req.params.requestId
            const {status} = req.body
            const request = await RequestService.updateStatus(requestId, status)
            return res.json(request)
        } catch (error) {
            next(error)
        }
    }
    async download(req, res, next) {
        try {
            const requestId = req.query.requestId
            const fileName = req.query.fileName

            const filePath = path.join(__dirname, '..', `files/${requestId}/${fileName}`)

            res.download(filePath, fileName, (err) => {
                if(err) {
                    console.log(err)
                    return res.status(404).json({status: 'error', message: err})
                }
            })

        } catch (error) {
            next(error)
        }
    }

    async uploadFiles(req, res, next) {
        try {
            const requestId = req.params.requestId
            const files = req.files
            const request = await RequestService.uploadFiles(requestId, files)
            return res.json({status: 'success', message: request})
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AdminController()
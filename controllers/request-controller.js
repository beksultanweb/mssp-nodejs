const ApiError = require('../exceptions/api-error')
const requestsService = require('../service/requests-service')
const RequestModel = require('../models/request-model')

class RequestsController {
    async getRequests(req, res, next) {
        try {
            const userId = req.params.userId
            const requests = await requestsService.getMyRequests(userId)
            return res.json(requests)
        } catch (error) {
            next(error)
        }
    }
    async getRequest(req, res, next) {
        try {
            const requestId = req.params.requestId
            const request = await requestsService.getRequest(requestId)
            return res.json(request)
        } catch (error) {
            next(error)
        }
    }
    async createRequest(req, res, next) {
        try {
            const { title, domain, phone } = req.body
            const userId = req.user.id
            const request = RequestModel.create({user: userId, title: title, domain: domain, date: new Date(), phone: phone, status: "новая", paid: false, reports: []})
            return res.json(request)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new RequestsController()
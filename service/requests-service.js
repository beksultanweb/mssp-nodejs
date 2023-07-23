const { request, json } = require('express')
const RequestModel = require('../models/request-model')
const UserModel = require('../models/user-model')
const path = require('path')

class RequestService {
    async getMyRequests(userId, status) {
        if(status !== '') {
            const requests = await RequestModel.find({user: userId, status: status})
            return requests
        }
        else {
            const requests = await RequestModel.find({user: userId})
            return requests
        }
    }
    async getAllRequests() {
        const requests = await RequestModel.find()
        return requests
    }
    async getRequest(requestId) {
        const request = await RequestModel.findById(requestId)
        return request
    }
    async updateStatus(requestId, status) {
        const filter = { _id: requestId }
        const update = { status: status }
        const request = await RequestModel.findOneAndUpdate(filter, update, {returnDocument: 'after'})
        return request
    }
    async uploadFiles(requestId, files) {
        Object.keys(files).forEach(key => {
            const filepath = path.join(__dirname, '..', `files/${requestId}`, files[key].name)
            files[key].mv(filepath, (err) => {
                if(err) return res.status(500).json({status: 'error', message: err})
            })
        })

        const request = await RequestModel.findOneAndUpdate({ _id: requestId }, { reports: Object.keys(files) })

        const result = Object.keys(files).toString()

        return result
    }
}

module.exports = new RequestService()
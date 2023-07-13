const {Schema, model} = require('mongoose')

const RequestSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    title: {type: String, required: true},
    date: {type: Date},
    phone: {type: String},
    status: {type: String},
    paid: {type: Boolean},
    comments: {type: String},
    domain: {type: String, required: true},
    reports: [{
        type: String
    }]
})

module.exports = model('Request', RequestSchema)
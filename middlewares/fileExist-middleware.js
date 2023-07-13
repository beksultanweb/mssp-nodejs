const filePayloadExitst = (req, res, next) => {
    if(!req.files) return res.status(400).json({status: error, message: 'Загруженный файл не найден'})
    next()
}

module.exports = filePayloadExitst
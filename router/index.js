const Router = require('express').Router
const userController = require('../controllers/user-controller')
const router = new Router()
const { body } = require('express-validator')
const authMiddleware = require('../middlewares/auth-middleware')
const ROLES_LIST = require('../config/roles_list')
const verifyRoles = require('../middlewares/role-middleware')
const requestController = require('../controllers/request-controller')
const adminController = require('../controllers/admin-controller')
const fileUpload = require('express-fileupload')
const filePayloadExitst = require('../middlewares/fileExist-middleware')
const fileExtLimiter = require('../middlewares/fileExt-middleware')
const fileSizeLimiter = require('../middlewares/fileSize-middleware')

router.post('/registration',
    body('firstName'),
    body('secondName'),
    body('email').isEmail(),
    body('password').isLength({min: 4, max: 24}),
    userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
// router.post('/password-reset', userController.resetpassword)
// router.post('/password-reset/:userId/:token', userController.setnewpassword)
router.get('/activate/:link', userController.activate)
router.get('/refresh', userController.refresh)
router.get('/requests/:userId', verifyRoles(ROLES_LIST.User), requestController.getRequests)
router.get('/request/:requestId', verifyRoles(ROLES_LIST.User), requestController.getRequest)
router.get('/download', verifyRoles(ROLES_LIST.User), adminController.download)
router.post('/requests', verifyRoles(ROLES_LIST.User), authMiddleware, requestController.createRequest)

router.get('/requests', verifyRoles(ROLES_LIST.Admin), adminController.getAllRequests)
router.post('/request/:requestId', verifyRoles(ROLES_LIST.Admin), adminController.updateStatus)
router.post('/upload/:requestId', fileUpload({createParentPath: true}), filePayloadExitst, fileExtLimiter(['.png', '.jpg', '.pdf', '.jpeg']), fileSizeLimiter, verifyRoles(ROLES_LIST.Admin), adminController.uploadFiles)
router.get('/getuser/:userId', verifyRoles(ROLES_LIST.Admin), adminController.getUser)

module.exports = router
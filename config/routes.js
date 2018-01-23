'use strict'

var Router = require('koa-router')

var User = require('../app/controllers/user')
var Order = require('../app/controllers/order')

module.exports = function() {
	var router = new Router()

	router.get('/', Order.index)

	router.post('/api/u/signup', User.signup)
	router.get('/api/u/validity', User.validity)
	router.post('/api/u/login', User.login)
	router.get('/api/u/logout', User.logout)
	router.get('/api/user/list', User.list)
	router.post('/api/user/update', User.update)
	router.get('/api/admin/authorize', User.authorize)

	router.post('/api/order/post', Order.post)
	router.get('/api/orderlist', Order.orderList)
	router.get('/api/order/detail', Order.detail)
	router.post('/api/order/finish', Order.finish)
	router.get('/api/order/info', Order.info)
	router.get('/api/order/infomore', Order.infoMore)

	return router
}
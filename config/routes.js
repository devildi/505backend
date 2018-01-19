'use strict'

var Router = require('koa-router')

var User = require('../app/controllers/user')
var Order = require('../app/controllers/order')

module.exports = function() {
	var router = new Router({
		prefix: '/api'
	})

	router.get('/', Order.index)

	router.post('/u/signup', User.signup)
	router.get('/u/validity', User.validity)
	router.post('/u/login', User.login)
	router.get('/u/logout', User.logout)
	router.get('/user/list', User.list)
	router.post('/user/update', User.update)
	router.get('/admin/authorize', User.authorize)

	router.post('/order/post', Order.post)
	router.get('/orderlist', Order.orderList)
	router.get('/order/detail', Order.detail)
	router.post('/order/finish', Order.finish)
	router.get('/order/info', Order.info)
	router.get('/order/infomore', Order.infoMore)

	return router
}
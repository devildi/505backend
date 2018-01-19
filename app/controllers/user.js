'use strict'

const mongoose = require('mongoose')
const User = mongoose.model('User')

exports.index = function*(next){
	yield this.render('index', {})
}
//中间件
exports.signinRequired = function*(next){
	let user = this.session.user || this.request.body.user
	if(user){
		yield next
	} else {
		this.body = {

		}
	}
}

exports.adminRequired = function*(next){
	let user = this.session.user
	if(user.role <= 10){
		this.body = {
			success: false,
			err: '您无权限'}
	}
	yield next()
}
//验证用户是否注册
exports.validity = function*(next){
	let id = null
	let employeeID = null
	let user = null
	employeeID = this.query.employeeID
	if(employeeID) {
		user = yield User.findOne({employeeID: employeeID}).exec()
		this.body = {
			user: user
		}
	} else {
		user = yield User.findOne({_id: this.query.id}).exec()
		this.body = {
			user: user
		}
	}
}
//注册
exports.signup = function*(next) {
	let body = this.request.body
	let user = null
	user = new User({
		name: body.name,
		employeeID: body.employeeID,
		code: body.code,
		address: body.address,
		department: body.department,
		phoneNum: body.phoneNum
	})
	try {
		user = yield user.save()
	}
	catch(e) {
		this.body = {success: false}
		return next
	}
	this.session = this.session || {}
	this.session.user = user
	this.body = {
		user: user
	}
}
//登录
exports.login = function*(next){
	let employeeID = this.request.body.employeeID
	let code = this.request.body.code
	let user = null
	user = yield User.findOne({employeeID: employeeID}).exec()
	if (!user){
		this.body = {hasRegistered: false}
		return next
	}
	if (code === user.code){
		this.session.user = user
		console.log("SESSION", this.session.user)
		this.body = {user: user}
	} else {
		this.body = {err:'用户密码错误'}
	}
}
//登出
exports.logout = function*(next){
	delete this.session.user
	if(this.session.user){
		this.body = {logout: false}
	} else{
		this.body = {logout: true}
	}
}
//普户列表
exports.list = function*(next){
	let users = null
	let usersTotal = null
	let id = this.query.id

	let count = 14
	let page = parseInt(this.query.page, 10) || 1
  let offset = (page - 1) * count

	if(id == 1){
		try{
			users = yield User.find({role:0}).skip(offset).limit(count).exec()
			usersTotal = yield User.find({role:0}).exec()
		}
		catch(e){
			this.body = {success: false}
			return next
		}
		this.body = {users: users, title: '普通用户列表', usersTotal: usersTotal}
	} else{
		try{
			users = yield User.find({role:50}).skip(offset).limit(count).exec()
			usersTotal = yield User.find({role:50}).exec()
		}
		catch(e){
			this.body = {success: false}
			return next
		}
		this.body = {users: users, title: '管理员用户列表', usersTotal: usersTotal}
	}	
}
//升级用户权限
exports.authorize = function*(next){
	let user = null 
	let id = this.query.id
	try{
		user = yield User.findOne({_id: id}).exec()
	}
	catch(e){
		this.body = {success: false}
		return next
	}
	user.role = 50
	try{
		user = yield user.save()
	}
	catch(e){
		this.body = {success: false}
		return next
	}
	this.body = {user: user}
}

exports.update = function*(next){
	let user = null
	let body = this.request.body
	user = this.session.user || body.user
	user = yield User.findOne({_id: user._id}).exec()
	user.phoneNum = body.phoneNum
	user.address = body.address
	user.department = body.department
	try{
		user = yield user.save()
	}
	catch(e){
		console.log(e)
		this.body = {success: false}
		return next
	}
	this.body = {user: user}
}
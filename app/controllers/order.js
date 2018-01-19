'use strict'

const mongoose = require('mongoose')
const Order = mongoose.model('Order')
const User = mongoose.model('User')
const moment = require('moment')
const Promise = require('bluebird')
var wss = require('../../websocket')

exports.index = function*(next){
	yield this.render('index/index', {})
}

//提交报修
exports.post = function*(next) {
	//console.log("SESSION", this.session.user)
	//console.log("BODY", this.request.body)
	let _order = null
	let order = null
	let user1 = this.session.user || this.request.body.user
	let user = yield User.findOne({employeeID: user1.employeeID}).exec()
	if(!user){
		console.log('err')
		return next
	}
	_order = new Order({
		user: user,
		request: this.request.body.request,
		serviceguy: '',
		response: ''
	})
	_order.meta.createAt = moment().format('YYYY-MM-DD HH:mm:ss')
	//console.log(moment(_order.meta.createAt).format('YYYY-MM-DD HH:mm:ss'))
	try{
		order = yield _order.save()
	}
	catch(err){
		this.body = {success: false}
		return next
	}
	let ordersTotal = yield Order.find({completedorNot: 0})
	this.body = {
		success: true
	}
	wss.broadcast(ordersTotal.length.toString())
}
//报修列表
exports.orderList = function*(next){
	let id = this.query.id
	let count = 14
	let page = parseInt(this.query.page, 10) || 1
  let offset = (page - 1) * count

	let orders = null
	let ordersTotal = null
	
	let today = moment().format('L')
	let tomorrow = moment().add(1,'day').format('L')

	if(id == 1){
		orders = yield Order.find({completedorNot: 0}).skip(offset).limit(count).sort({'meta.createAt':-1}).populate('user').exec()
		ordersTotal = yield Order.find({completedorNot: 0})
		if(!orders){
			return next
		}
		this.body = {orders: orders, title: '未完成', ordersTotal: ordersTotal}
	} else if(id == 2){
		orders = yield Order.find({completedorNot: 1,'meta.updateAt':{"$gte": today, $lt: tomorrow}}).skip(offset).limit(count).sort({'meta.createAt':-1}).populate('user').exec()
		ordersTotal = yield Order.find({completedorNot: 1,'meta.updateAt':{"$gte": today, $lt: tomorrow}})
		if(!orders){
			return next
		}
		this.body = {orders: orders, title: '今日已完成', ordersTotal: ordersTotal}
	} else {
		orders = yield Order.find({completedorNot: 1}).skip(offset).limit(count).sort({'meta.createAt':-1}).populate('user').exec()
		ordersTotal = yield Order.find({completedorNot: 1})
		if(!orders){
			return next
		}
		this.body = {orders: orders, title: '全部已完成', ordersTotal: ordersTotal}
	}
}
//中间件
exports.Required = function*(next){
	console.log('iii')
	let id = this.query.id
	let order = yield Order.findOne({_id: id}).exec()
	if(order.fixing){
		this.body = {

		}
		return next
	} else {
		yield next
	}
}
//报修详情
exports.detail = function*(next){
	let id = this.query.id
	let order = yield Order.findOne({_id: id}).exec()
	let user = yield User.findOne({_id: order.user}).exec()
	//order.fixing = true
	//order = yield order.save()
	this.body = {
		order: order,
    user: user
	}
}
//完成报修
exports.finish = function*(next){
	let response = this.request.body.response
	let serviceguy = this.session.user.name
	var orderId = this.request.body.orderId
	let order = yield Order.findOne({_id: orderId}).exec()
	order.response = response
	order.serviceguy = serviceguy
	//order.fixing = false
	order.completedorNot = 1
	order.meta.updateAt = moment().format('YYYY-MM-DD HH:mm:ss')
	//console.log(moment(order.meta.updateAt).format('YYYY-MM-DD HH:mm:ss'))
	try{
		order = yield order.save()
	}
	catch(err){
		this.body = {success: false}
		return next
	}
	this.body={success: true}
}
//图表查询
exports.info = function*(next){
	let id = null
	id = this.query.id
	var today = moment().format('L')
	var tomorrow = moment().add(1,'day').format('L')
	var LD = moment().subtract(1,'day').format('L')
	var LLD = moment().subtract(2,'day').format('L')
	var LLLD = moment().subtract(3,'day').format('L')
	var LLLLD = moment().subtract(4,'day').format('L')
	var LLLLLD = moment().subtract(5,'day').format('L')
	var LLLLLLD = moment().subtract(6,'day').format('L')

	var Dd = moment().format('d')//当个周第几天
	var firstOfMonth = moment().startOf('month').format("L")
	var lastOfMonth = moment().endOf('month').format("L")
	var firstOfWeek = moment().startOf('week').format("L")
	var lastOfWeek = moment().endOf('week').format("L")
	//data[0].length, data[1].length, data[2].length, data[3].length, data[4].length, data[5].length, data[6].length
	// Promise.all([
	// 	Order.find({'meta.updateAt':{"$gte": today, $lt: tomorrow}}).exec(),
	// 	Order.find({'meta.updateAt':{"$gte": firstOfWeek, $lt: lastOfWeek}}).exec(),
	// 	Order.find({'meta.updateAt':{"$gte": firstOfMonth, $lt: lastOfMonth}}).exec(),
	// 	Order.find({'meta.updateAt':{"$gte": LD, $lt: today}}).exec(),
	// 	Order.find({'meta.updateAt':{"$gte": LLD, $lt: LD}}).exec(),
	// 	Order.find({'meta.updateAt':{"$gte": LLLD, $lt: LLD}}).exec(),
	// 	Order.find({'meta.updateAt':{"$gte": LLLLD, $lt: LLLD}}).exec(),
	// 	])
	// 	.then((data) => console.log(data.length))
	// 	.catch((err)=>console.log(err))
	var data1 = yield Order.find({'meta.updateAt':{"$gte": today, $lt: tomorrow}}).exec()
	var data2 = yield Order.find({'meta.updateAt':{"$gte": LD, $lt: today}}).exec()
	var data3 = yield Order.find({'meta.updateAt':{"$gte": LLD, $lt: LD}}).exec()
	var data4 = yield Order.find({'meta.updateAt':{"$gte": LLLD, $lt: LLD}}).exec()
	var data5 = yield Order.find({'meta.updateAt':{"$gte": LLLLD, $lt: LLLD}}).exec()
	var data6 = yield Order.find({'meta.updateAt':{"$gte": LLLLLD, $lt: LLLLD}}).exec()
	var data7 = yield Order.find({'meta.updateAt':{"$gte": LLLLLLD, $lt: LLLLLD}}).exec()
	if(id){
		this.body={data: [[today, data1.length],
			[LD, data2.length], 
			[LLD, data3.length], 
			[LLLD, data4.length], 
			[LLLLD, data5.length], 
			[LLLLLD, data6.length],
			[LLLLLLD, data7.length]]}
	} else{
		this.body={data: [{name: today,'工单数':data1.length}, {name: LD,'工单数':data2.length}, {name: LLD,'工单数':data3.length}, {name: LLLD,'工单数':data4.length}, {name: LLLLD,'工单数':data5.length}, {name: LLLLLD,'工单数':data6.length}, {name: LLLLLLD,'工单数':data7.length}]}
	}
}

exports.infoMore = function*(next){
	let id = this.query.id
	let obj = {}
	let array = []
	let array1 = []
	let array2 = []
	let array3 = []
	var firstOfMonth = moment().startOf('month').format("L")
	var lastOfMonth = moment().endOf('month').format("L")
	var data = yield Order.find({'meta.updateAt':{"$gte": firstOfMonth, $lt: lastOfMonth}}).populate('user').exec()
	if(data){
		var data1 = data.map((i) => i.user.department)
		for( var i =0; i<data1.length; i++){
			if(obj[data1[i]]){
				obj[data1[i]] = obj[data1[i]]+1
			} else {
				obj[data1[i]] = 1
			}
		}
		for (var key in obj){
			array.push({name:key,value:obj[key]})
		}

		array.sort((a, b) => a.value < b.value)
		if(array.length > 5){
			array1 = array.slice(0,5)
			for (var i = 0;i < array1.length; i++){
				array2.push([array1[i].name, array1[i].value])
			}
			for( var i =0; i<array2.length; i++){
				array3.push({name: array2[i][0], value: array2[i][1]})
			}
		} else {
			array2 = array
			array3 = array
		}
	}
	
	//console.log(array, array3)
	if(id){
		this.body = {data: array2}
	} else{
		this.body = {data: array3}
	}
}
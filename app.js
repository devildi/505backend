'use strict'

var fs = require('fs')
var path = require('path')
var mongoose = require('mongoose')
var views = require('koa-views')
var staticServer = require('koa-static')
var db = 'mongodb://localhost/505'
//var wss = require('./websocket')

mongoose.connect(db)
mongoose.Promise = require('bluebird')

var model_path = path.join(__dirname, './app/models')
var walk = function(modelPath){
	fs
		.readdirSync(modelPath)
		.forEach(function(item){
			var filePath = path.join(modelPath ,'/' + item)
			var stat = fs.statSync(filePath)
			if(stat.isFile()) {
					require(filePath)
				} 
				else if (stat.isDirectory()) {
					walk(filePath)
			}
		})
}
walk(model_path)

var koa = require('koa')
var logger = require('koa-logger')
var session = require('koa-session')
var bodyParser = require('koa-bodyparser')


var app = new koa()

app.keys = ['387694318']
app.use(logger())
app.use(session(app))
app.use(bodyParser())
app.use(views(__dirname + '/views', {
  extension: 'jade'
}))
app.use(staticServer(__dirname + '/views'))

var router = require('./config/routes')()

app
	.use(router.routes())
	.use(router.allowedMethods())

app.listen(1234)
console.log('Listening port:1234')

// var server = require('http').createServer(app.callback());
// var io = require('socket.io')(server);
// io.on('connection', function(){ 
//  console.log('connect')
// });
// server.listen(3000);

// var io = require('socket.io-client')('http://localhost',{
//    "serveClient": false ,
//    "transports": ['websocket', 'polling']
// })
// io.on('connection', function (socket) {
//    console.log('connected')
//    // 当用户断开时执行此指令
//    socket.on('disconnect', function () {
//    	console.log('uu')
//    });
// }) 
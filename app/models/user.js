'use strict'

var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
	name: String,
	employeeID: {unique: true,	type: String},
	code: String,
	address: String,
	department: String,
	phoneNum: String,
	role: { type: Number,default: 0 },
	meta: {
		createAt: {type: Date,default: Date.now()},
		updateAt: {type: Date,defaule: Date.now()}
	}
})		

UserSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('User', UserSchema)
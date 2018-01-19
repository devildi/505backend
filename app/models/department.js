'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const DepartmentSchema = new Schema({
	men:[{type: ObjectId, ref: 'User'}],
	name: String,
	order: [{type: ObjectId, ref: 'Order'}]
})

module.exports = mongoose.model('Department', DepartmentSchema)
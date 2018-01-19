const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const OrderSchema = new Schema({
	user: {type: ObjectId, ref: 'User'},
	request: String,
	completedorNot: {type: Number,default: 0},
	//fixing: {type: Boolean, default: false},
	serviceguy: String,
	response: String,
	meta: {createAt: {type: Date,default: Date.now()},
	    updateAt: {type: Date,default: Date.now()}}
})

OrderSchema.pre('save', function(next) {
	next()
})

OrderSchema.statics = {
	fetch: function(cb) {
		return this
			.find({completedorNot: 1})
      .populate('user')
      .sort({'meta.updateAt':-1})
      .exec(cb)
	}
}

module.exports = mongoose.model('Order', OrderSchema)
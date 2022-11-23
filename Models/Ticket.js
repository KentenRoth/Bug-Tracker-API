const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
	created: {
		type: Number,
		default: Date.now,
		trim: true,
	},
	summary: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		required: true,
		trim: true,
	},
	completed: {
		type: Boolean,
		default: false,
		required: true,
	},
	priority: {
		type: String,
		required: true,
	},
	assigned: {
		type: String,
		trim: true,
	},
	status: {
		type: String,
		trim: true,
	},
	assigneedTo: {
		type: String,
		trim: true,
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Project',
	},
});

module.exports = Ticket = mongoose.model('Ticket', TicketSchema);

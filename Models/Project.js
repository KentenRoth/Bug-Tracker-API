const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
	created: {
		type: Number,
		default: Date.now,
		trim: true,
	},
	title: {
		type: String,
		required: true,
		trim: true,
	},
	owner: {
		type: mongoose.SchemaType.Types.ObjectID,
		required: true,
		ref: 'User',
	},
	Admin: [
		{
			person: {
				type: String,
				trim: true,
			},
		},
	],
	Team: [
		{
			memeber: {
				type: String,
				trim: true,
			},
		},
	],
});

// Links tickets to projects
ProjectSchema.virtual('tickets', {
	ref: 'Ticket',
	localField: '_id',
	foreignField: 'owner',
});

module.exports = Project = mongoose.model('Project', ProjectSchema);

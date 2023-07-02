const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');

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
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	admins: [
		{
			name: {
				type: String,
				trim: true,
				required: true,
			},
			id: {
				type: String,
				trim: true,
				required: true,
			},
		},
	],
	teams: [
		{
			name: {
				type: String,
				trim: true,
				required: true,
			},
			id: {
				type: String,
				trim: true,
				required: true,
			},
		},
	],
	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
});

ProjectSchema.virtual('tickets', {
	ref: 'Ticket',
	localField: '_id',
	foreignField: 'owner',
});

ProjectSchema.methods.createAuthToken = async function () {
	const project = this;
	const token = jwt.sign(
		{ _id: project._id.toString() },
		process.env.HIDDEN_SENTENCE
	);
	project.tokens = project.tokens.concat({ token });
	await project.save();

	return token;
};

module.exports = Project = mongoose.model('Project', ProjectSchema);

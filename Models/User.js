const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Ticket = require('./Ticket');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: {
		type: String,
		required: true,
		minlength: 2,
		trim: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
		minlength: 2,
		trim: true,
	},
	email: {
		type: String,
		unique: true,
		rquired: true,
		trim: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email is not valid');
			}
		},
	},
	password: {
		type: String,
		required: true,
	},
	resetCode: {
		type: Number,
		required: false,
	},
	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
});

UserSchema.virtual('projects', {
	ref: 'Project',
	localField: '_id',
	foreignField: 'owner',
});

UserSchema.virtual('admin', {
	ref: 'Project',
	localField: '_id',
	foreignField: 'admins.admin',
});

UserSchema.virtual('team', {
	ref: 'Projects',
	localField: '_id',
	foreignField: 'team',
});

UserSchema.methods.createAuthToken = async function () {
	const user = this;
	const token = jwt.sign(
		{ _id: user._id.toString() },
		process.env.HIDDEN_SENTENCE
	);

	user.tokens = user.tokens.concat({ token });
	await user.save();

	return token;
};

UserSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;

	return userObject;
};

UserSchema.statics.findByCredentials = async (username, password) => {
	const user = await User.findOne({ username });

	if (!user) {
		throw new Error('Please check login information');
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		throw new Error('Please check login information');
	}

	return user;
};

UserSchema.pre('save', async function (next) {
	const user = this;

	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}

	next();
});

UserSchema.pre('remove', async function (next) {
	const user = this;
	await Ticket.deleteMany({ owner: user._id });
	next();
});

module.exports = User = mongoose.model('User', UserSchema);

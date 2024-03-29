const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		const decoded = jwt.verify(token, process.env.HIDDEN_SENTENCE);
		const user = await User.findOne({
			_id: decoded._id,
			'tokens.token': token,
		});

		if (!user) {
			throw new Error();
		}
		req.token = token;
		req.user = user;
		next();
	} catch (error) {
		res.status(401).send({ error: 'No authentication' });
	}
};

module.exports = auth;

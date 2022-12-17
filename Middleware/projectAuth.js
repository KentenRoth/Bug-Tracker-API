const jwt = require('jsonwebtoken');
const Project = require('../Models/Project');

const projectAuth = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		const decoded = jwt.verify(token, process.env.HIDDEN_SENTENCE);
		const project = await Project.findOne({
			_id: decoded._id,
			'tokens.token': token,
		});
		if (!project) {
			throw new Error();
		}
		req.token = token;
		req.project = project;
		next();
	} catch (error) {
		res.status(401).send({ error: 'No authentication' });
	}
};

module.exports = projectAuth;

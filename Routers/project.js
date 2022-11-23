const express = require('express');
const router = new express.Router();
const auth = require('../Middleware/auth');
const Project = require('../Models/Project');

router.post('/projects', auth, async (req, res) => {
	const project = new Project({
		...req.body,
		owner: req.user._id,
	});
	try {
		await project.save();
		const authToken = await project.createAuthToken();
		res.status(201).send({ project, authToken });
	} catch (error) {
		res.status(400).send(error);
	}
});

router.get('/projects', auth, async (req, res) => {
	try {
		let projects = await Project.find({
			$or: [
				{ owner: req.user._id },
				{ admin: req.user._id.toString() },
				{ team: req.user._id.toString() },
			],
		})
			.populate({
				path: 'projects',
			})
			.exec();

		res.send(projects);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.get('/projects/:id', auth, async (req, res) => {
	try {
		const project = await Project.findOne({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!project) {
			return res.status(404).send();
		}
		res.send(project);
	} catch (error) {
		res.status(500).send();
	}
});

router.patch('/projects/:id', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['title', 'admin', 'team'];
	const isValidUpdate = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isValidUpdate) {
		return res.status(400).send({ error: 'Update is invalid' });
	}

	try {
		const project = await Project.findOne({
			_id: req.params.id,
			owner: req.user._id,
		});

		if (!project) {
			res.status(404).send();
		}

		updates.forEach((updates) => (project[updates] = req.body[updates]));
		await project.save();

		res.send(project);
	} catch (error) {
		res.status(500).send();
	}
});

router.delete('/projects/:id', auth, async (req, res) => {
	try {
		const project = await Project.findOneAndDelete({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!project) {
			return res.status(404).send();
		}
		res.send(project);
	} catch (error) {
		res.status(500).send();
	}
});

module.exports = router;

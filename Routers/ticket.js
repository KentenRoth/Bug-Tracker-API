const express = require('express');
const router = new express.Router();
const projectAuth = require('../Middleware/projectAuth');
const Ticket = require('../Models/Ticket');

router.post('/tickets', projectAuth, async (req, res) => {
	const ticket = new Ticket({
		...req.body,
		owner: req.project._id,
	});

	try {
		await ticket.save();
		res.send(ticket);
	} catch (error) {
		res.status(400).send(error);
	}
});

router.get('/tickets', projectAuth, async (req, res) => {
	const match = {};

	if (req.query.completed) {
		match.completed = req.query.completed === 'true';
	}

	try {
		await req.project
			.populate({
				path: 'tickets',
				match,
			})
			.execPopulate();
		res.send(req.project.tickets);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.get('/tickets/:id', projectAuth, async (req, res) => {
	try {
		const ticket = await Ticket.findOne({
			_id: req.params.id,
			owner: req.project._id,
		});
		if (!ticket) {
			return res.status(404).send();
		}
		res.send(ticket);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.patch('/tickets/:id', projectAuth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = [
		'completed',
		'priority',
		'summary',
		'description',
		'status',
		'assigned',
		'assignedTo',
	];
	const isValidUpdate = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isValidUpdate) {
		return res.status(400).send({ error: 'Update not accepted.' });
	}

	try {
		const ticket = await Ticket.findOne({
			_id: req.params.id,
			owner: req.project._id,
		});

		if (!ticket) {
			res.status(404).send();
		}

		updates.forEach((update) => (ticket[update] = req.body[update]));
		await ticket.save();

		res.send(ticket);
	} catch (error) {
		res.status(500).send();
	}
});

router.delete('/tickets/:id', projectAuth, async (req, res) => {
	try {
		const ticket = await Ticket.findOneAndDelete({
			_id: req.params.id,
			owner: req.project._id,
		});
		if (!ticket) {
			return res.status(404).send();
		}
		res.send(ticket);
	} catch (error) {
		res.status(500).send();
	}
});

module.exports = router;

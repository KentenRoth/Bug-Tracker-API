const express = require('express');
const router = new express.Router();
const auth = require('../Middleware/auth');
const Ticket = require('../Models/Ticket');

router.post('/tickets', auth, async (req, res) => {
	const ticket = new Ticket({
		...req.body,
		owner: req.user._id
	});

	try {
		await ticket.save();
		res.send(ticket);
	} catch (error) {
		res.status(400).send(error);
	}
});

router.get('/tickets', auth, async (req, res) => {
	const match = {};

	if (req.query.completed) {
		match.completed = req.query.completed === 'true';
	}

	try {
		await req.user
			.populate({
				path: 'tickets',
				match
			})
			.execPopulate();
		res.send(req.user.tickets);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.get('/tickets/:id', auth, async (req, res) => {
	try {
		const ticket = await Ticket.findOne({
			_id: req.params.id,
			owner: req.user._id
		});
		if (!ticket) {
			return res.status(404).send();
		}
		res.send(ticket);
	} catch (error) {
		res.status(500).send();
	}
});

router.patch('/tickets/:id', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = [
		'completed',
		'priority',
		'project',
		'summary',
		'description'
	];
	const isValidUpdate = updates.every(update =>
		allowedUpdates.includes(update)
	);

	if (!isValidUpdate) {
		return res.status(400).send({ error: 'Update not accepted.' });
	}

	try {
		const ticket = await Ticket.findOne({
			_id: req.params.id,
			owner: req.user._id
		});

		if (!ticket) {
			res.status(404).send();
		}

		updates.forEach(update => (ticket[update] = req.body[update]));
		await ticket.save();

		res.send(ticket);
	} catch (error) {
		res.status(500).send();
	}
});

router.delete('/tickets/:id', auth, async (req, res) => {
	try {
		const ticket = await Ticket.findOneAndDelete({
			_id: req.params.id,
			owner: req.user._id
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

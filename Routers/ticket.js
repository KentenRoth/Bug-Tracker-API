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

router.patch('/tickets/reorder', projectAuth, async (req, res) => {
	const { project } = req;
	const { ticketIds } = req.body;

	try {
		const tickets = await Ticket.find({ owner: project._id });

		const ticketIndexMap = {};
		tickets.forEach((ticket, index) => {
			ticketIndexMap[ticket._id.toString()] = index;
		});

		const updatedTickets = [];
		ticketIds.forEach((ticketId, index) => {
			const ticket = tickets.find((t) => t._id.toString() === ticketId);
			if (ticket) {
				ticketIndexMap[ticketId] = index;
				updatedTickets.push(ticket);
			}
		});

		updatedTickets.sort(
			(a, b) =>
				ticketIndexMap[a._id.toString()] -
				ticketIndexMap[b._id.toString()]
		);

		for (let i = 0; i < updatedTickets.length; i++) {
			const ticket = updatedTickets[i];
			ticket.order = i;
			await ticket.save();
		}

		res.send(updatedTickets);
	} catch (error) {
		res.status(500).send();
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

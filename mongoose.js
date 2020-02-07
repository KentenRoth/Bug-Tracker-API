const mongoose = require('mongoose');

mongoose.connect(
	'mongodb+srv://BugTracker:TaylorJean@cluster0-9kkq7.mongodb.net/test?retryWrites=true&w=majority',
	{
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	}
);

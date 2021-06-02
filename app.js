// Require modules
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

// Require model(s)
const Campground = require('./models/campground');

// Mongoose Setup
mongoose
	.connect('mongodb://localhost:27017/yelp-camp', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true
	})
	.then(() => {
		console.log('Mongo connection open!');
	})
	.catch((err) => {
		console.log('Some mongo error');
		console.log(err);
	});
mongoose.set('useFindAndModify', false);

// EJS setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// Body parser setup
app.use(express.urlencoded({ extended: true }));

// Method Override setup
app.use(methodOverride('_method'));

// Routing start*******************************************
// Homepage routing
app.get('/', (req, res) => {
	res.render('home');
});

// Index route
app.get('/campgrounds', async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
});

// New route
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});
// Show route
app.get('/campgrounds/:id', async (req, res) => {
	const { id } = req.params;
	const foundCampground = await Campground.findById(id);
	res.render('campgrounds/show', { foundCampground });
});

// Create route
app.post('/campgrounds', async (req, res, next) => {
	try {
		const { campground } = req.body;
		const newCampground = new Campground({
			title: campground.title,
			location: campground.location,
			description: campground.description,
			image: campground.image,
			price: campground.price
		});
		await newCampground.save();
		res.redirect(`/campgrounds/${newCampground.id}`);
	} catch (e) {
		next(e);
	}
});

// Edit route
app.get('/campgrounds/:id/edit', async (req, res) => {
	const { id } = req.params;
	const foundCampground = await Campground.findById(id);
	res.render('campgrounds/edit', { foundCampground });
});

// Update route
app.patch('/campgrounds/:id', async (req, res) => {
	const { id } = req.params;
	const { campground } = req.body;
	await Campground.findByIdAndUpdate(id, campground);
	res.redirect(`/campgrounds/${id}`);
});

// Delete route
app.delete('/campgrounds/:id', async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndRemove(id);
	res.redirect('/campgrounds');
});
// Routing ends********************************************

// Basic error handler
app.use((err, req, res, next) => {
	res.send('Oh boy something went wrong!!!');
});

//Server
app.listen(3000, () => {
	console.log('Listening on port 3000');
});

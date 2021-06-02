// Require modules
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Joi = require('joi');

// Require model(s)
const Campground = require('./models/campground');

// Custom error class & catchAsync function
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

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
app.get(
	'/campgrounds',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

// New route
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});

// Show route
app.get(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const foundCampground = await Campground.findById(id);
		res.render('campgrounds/show', { foundCampground });
	})
);

// Create route
app.post(
	'/campgrounds',
	catchAsync(async (req, res, next) => {
		const campgroundSchema = Joi.object({
			campground: Joi.object({
				title: Joi.string().required(),
				location: Joi.string().required(),
				description: Joi.string().required(),
				image: Joi.string().required(),
				price: Joi.number().required().min(0)
			}).required()
		});
		const { error } = campgroundSchema.validate(req.body);
		if (error) {
			const msg = error.details.map((el) => el.message).join(', ');
			throw new ExpressError(400, msg);
		}
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
	})
);

// Edit route
app.get(
	'/campgrounds/:id/edit',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const foundCampground = await Campground.findById(id);
		res.render('campgrounds/edit', { foundCampground });
	})
);

// Update route
app.patch(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const { campground } = req.body;
		await Campground.findByIdAndUpdate(id, campground);
		res.redirect(`/campgrounds/${id}`);
	})
);

// Delete route
app.delete(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndRemove(id);
		res.redirect('/campgrounds');
	})
);
// Routing ends********************************************

// 404 route
app.all('*', (req, res, next) => {
	next(new ExpressError(404, 'Page not found!'));
});

// Basic error handler
app.use((err, req, res, next) => {
	if (!err.message) {
		err.message = 'Something went wrong';
	}
	if (!err.statusCode) {
		err.statusCode = 500;
	}
	res.status(err.statusCode).render('error', { err });
});

//Server
app.listen(3000, () => {
	console.log('Listening on port 3000');
});

// Require model and modules
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');
const Campground = require('../models/campground');

//Mongoose Setup
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

// Function to return a random array element
const randomArrayElement = (arr) => {
	return arr[Math.floor(Math.random() * arr.length)];
};

// Function to add campgrounds to db using seed data
const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			title: `${randomArrayElement(descriptors)} ${randomArrayElement(places)}`,
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			image: 'https://source.unsplash.com/collection/429524',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.laboris nisi ut aliquip ex ea commodo consequat.',
			price
		});
		await camp.save();
	}
};

// Running the seed function
seedDB().then(() => {
	mongoose.connection.close();
});

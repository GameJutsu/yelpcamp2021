const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
	title: String,
	price: Number,
	image: String,
	location: String,
	description: String,
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review'
		}
	]
});

CampgroundSchema.post('findOneAndDelete', async (data) => {
	if (data) {
		await review.deleteMany({ _id: { $in: data.reviews } });
	}
});

module.exports = mongoose.model('Campground', CampgroundSchema);

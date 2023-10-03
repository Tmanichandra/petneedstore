const mongoose = require('mongoose');

const companyDescSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desc: String,
    address: String
});

const prodVariationSchema = new mongoose.Schema({
    variation: String,
    price: Number
});

const reviewSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    reviewText: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        'default': Date.now
    }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imgSrc: String,
    smalDesc: String,
    prodDesc: String,
    rating: {
        type: Number,
        'default': 0,
        min: 0,
        max: 5
    },
    tags: [String],
    company: companyDescSchema,
    prodVar: [prodVariationSchema],
    reviews: [reviewSchema]
});

mongoose.model('Product', productSchema);

const mongoose = require('mongoose');
const Prod = mongoose.model('Product');

async function reviewsCreate(req, res) {
    const productId = req.params.productid;
    try {
        await Prod
            .findById(productId)
            .select('reviews')
            .then(function (product) {
                res.status(201);
                doAddReview(req, res, product);
            });
    } catch (err) {
        res.status(400)
            .json(err);
    }
};
async function reviewsReadOne(req, res) {
    try {
        const prodId = await Prod.findById(req.params.productid)
        .select("name reviews")
            .then(function (product) {
                if (product.reviews && product.reviews.length > 0) {
                    const review = product.reviews.id(req.params.reviewid);
                    response = {
                        product: {
                            name: product.name,
                            id: req.params.productid
                        },
                        review
                    }
                    res
                        .status(200)
                        .json(review);
                } else {
                    return res
                        .status(404)
                        .json({ "message": "No Reviews found" });
                }
            });
    } catch (err) {
        return res
            .status(404)
            .json(err);
    }
};
async function reviewsUpdateOne(req, res) {
    try {
        await Prod.findById(req.params.productid)
            .select('reviews')
            .then(function (product) {
                if (product.reviews && product.reviews.length > 0) {
                    const thisReview = product.reviews.id(req.params.reviewid);
                    thisReview.author = req.body.author;
                    thisReview.rating = req.body.rating;
                    thisReview.reviewText = req.body.reviewText;
                    try {
                        product.save(product)
                            .then(function (err, product) {
                                if (err) {
                                    return res.status(400).json(err);
                                } else {
                                    updateAvgRating(product._id);
                                    res.status(200).json(thisReview);
                                }
                            });
                    } catch (err) {
                        console.log(err);
                        return res.status(404).json(err);
                    }
                }
            });
    } catch (err) {
        return res.status(404).json({ "message": "productid and reviewid both required" });
    }
};
async function reviewsDeleteOne(req, res) {
    try {
        const { productid, reviewid } = req.params;
        await Prod.findById(productid)
            .select('reviews')
            .then(function () {
                if (product.reviews && product.reviews.length > 0) {
                    if (!product.reviews.id(reviewid)) {
                        return res.status(404).json({ "message": "Review Not Found" });
                    } else {
                        product.reviews.id(reviewid).remove()
                            .then(function () {
                                updateAvgRating(product._id);
                                res.status(204).json(null);
                            });
                    }
                } else {
                    res.status(404).json({ "message": "No Review to delete" });
                }
            });
    } catch (err) {
        return res.status(404).json({ "message": "productid and reviewid both are required" });
    }
};


//Other Functions

async function doAddReview(req, res, product) {
    try {
        const { author, rating, reviewText } = req.body;
        await product.reviews.push({
            author,
            rating,
            reviewText
        })
        try {
            await product.save(product)
                .then(function (product) {
                    updateAvgRating(product._id);
                    const thisReview = product.reviews.slice(-1).pop();
                    res.status(201).redirect('/product/`${product._id}`');
                });
        } catch (err) {
            res.status(400).json(err);
        }
    } catch(err) {
        res.status(400).json(err);
    }
}

async function doSetAvgRating(product) {
    try {
        if (product.reviews && product.reviews.length > 0) {
            const count = product.reviews.length;
            const total = await product.reviews.reduce((acc, { rating }), 0)
                .then(function (acc, rating) {
                    return acc + rating;
                });
            product.rating = parseInt(total / count, 10);
            try {
                await product.save()
                    .then(function (err, product) {
                        if (err) return res.status(400).json(err);
                        console.log('Average rating updated to ${product.rating');
                    });
            } catch (err) {
                console.log(err);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function updateAvgRating(productId) {
    try {
        await Prod.findById(productId)
            .select('rating reviews')
            .then(function (product) {
                doSetAvgRating(product);
            });
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    reviewsCreate,
    reviewsReadOne,
    reviewsUpdateOne,
    reviewsDeleteOne
};
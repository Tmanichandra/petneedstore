const mongoose = require('mongoose');
const Prod = mongoose.model('Product');
const express = require('express');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('petneedstore_resources');

const gcdpath = `https://storage.googleapis.com/petneedstore_resources/images/`;

express().use(express.urlencoded({ extended: true }));

async function productsAll(req, res) {
    try {
        const data = await Prod.find({})
            .then(function (products) {
                res.status(200).json(products);
            })
    } catch (err) {
        res.status(404).json(err);
    }
};
async function productsCreate (req, res) {
    let imgSrcVar = {source : "NOT FOUND.png"};
    try {
        uploadFile(req, res, imgSrcVar);
        const prod = await Prod.create({
            name: req.body.name,
            smalDesc: req.body.smalDesc,
            prodDesc: req.body.prodDesc,
            tags: req.body.tags.split(','),
            imgSrc: `${gcdpath}${imgSrcVar.source}`,
            prodVar: [{
                variation: req.body.variation1,
                price: req.body.price1
            }, {
                variation: req.body.variation2,
                price: req.body.price2
            }, {
                variation: req.body.variation3,
                price: req.body.price3
            }],
            company: {
                name: req.body.cname,
                desc: req.body.cdesc,
                address: req.body.caddress
            }
        })
        .then(function (product) {
            res
                .status(201)
                .redirect('/');
        });
    } catch (err) {
        return res
            .status(404)
            .json("PetNeeds Error : " + err);
    }
};
async function productsReadOne(req, res) {
    try {
        const prodId = await Prod.findById(req.params.productid)
            .then(function (product) {
                res
                    .status(200)
                    .json(product);
            });
    } catch (err) {
        return res
            .status(404)
            .json(err);
    }
};
async function productsUpdateOne (req, res) {
    try {
        await Prod
            .findById(req.params.productid)
            .select('-reviews -rating')
            .then(function (product) {
                product.name = req.body.name;
                product.smalDesc = req.body.smalDesc;
                product.prodDesc = req.body.prodDesc;
                product.tags = req.body.tags.split(',');
                product.company = {
                    name: req.body.cname,
                    desc: req.body.cdesc,
                    address: req.body.caddress
                };
                product.prodVar = [{
                    variation: req.body.variation1,
                    price: req.body.price1
                }, {
                    variation: req.body.variation2,
                    price: req.body.price2
                }];
            });
        try {
            product.save(prod)
                .then(res.status(200).json(loc));
        } catch (err) {
            res.status(404).json(err);
        }
    } catch (err) {
        return res.status(404).json(err);
    }
};
async function productsDeleteOne (req, res) {
    try {
        const { productid } = req.params;
        if (productid) {
            Prod.findByIdAndRemove(productid)
                .then(function (product) {
                    res.status(204).json(null);
                });
        } else {
            res.status(404).json({ "message": "No Product" });
        }
    } catch (err) {
        return res.status(404).json(err);
    }
};

async function uploadFile(req, res, imgSrcVar) {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileName = "img-" + Math.random().toString(8) + ".jpeg";
    const gcsFileName = `images/${fileName}`;
    imgSrcVar.source = `${fileName}`;

    const stream = bucket.file(gcsFileName).createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
    });

    stream.on('error', (err) => {
        console.error(err);
        return res.status(500).send('Error uploading file to Google Cloud Storage.');
    });

    stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/petneedstore_resources/${gcsFileName}`;
        console.log(`Images saved to ${publicUrl}`);
        res.status(200);
    });

    stream.end(file.buffer);
}


module.exports = {
    productsAll,
    productsCreate,
    productsReadOne,
    productsUpdateOne,
    productsDeleteOne,
    uploadFile
};
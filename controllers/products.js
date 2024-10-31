const { Product } = require('../models/product');

exports.getProducts = async function (_, res) {
    try {
        let products;
        const page = req.query.page || 1;
        const pageSize = 10;

        if (req.query.criteria) {
            let query = {};
            if (req.query.category) {
                query['category'] = req.query.category;
            }


            switch (req.query.criteria) {
                case 'newArrivals': {
                    const twoWeekAgo = new Date();
                    twoWeekAgo.setDate(twoWeekAgo.getDate() - 14);
                    query['dateAdded'] = { $gte: twoWeekAgo };
                    break;
                }
                case 'popular':
                    query['rating'] = { $gte: 4.5 };
                    break;
                default:
                    break;
            }
            products = await Product.find(query)
                .select('-imageDetail -size')
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        } else if (req.query.category) {
            products = await Product.find({ category: req.query.category })
                .select('-imageDetail -size')
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        } else {
            products = await Product.find()
                .select('-imageDetail -size')
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        }
        if (!products) {
            return res.status(404).json({ message: 'Products not found' });
        }
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.staus(500).json({ type: error.name, message: error.message });
    }
}


exports.searchProduct = async function (req, res) {
    try {
        const searchTerms = req.query.q;

        const page = req.query.page || 1;
        const pageSize = 10;

        // const simpleTextSearch = name: {$regex: searchTerms, $option: 'i'};
        // const indexTextSearch = $text: {
        //     $search: searchTerms,
        //     $language: 'english',
        //     $caseSensitive: false,
        // };

        let query = {}
        if (req.query.category) {
            query = { category: req.query.category, };
            if (req.query.genderAgecategory) {
                query['genderAgecategory'] = req.query.genderAgecategory.toLowerCase();
            }
        } else if (req.query.genderAgecategory) {
            query = { genderAgecategory: req.query.genderAgecategory.toLowerCase(), };
        }
        if (searchTerms) {
            query = {
                ...query,
                $text: {
                    $search: searchTerms,
                    $language: 'english',
                    $caseSensitive: false,
                }
            };
        }
        const searchResults = await Product.find(query)
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        return res.json(searchResults);
    } catch (error) {
        console.error(error);
        return res.staus(500).json({ type: error.name, message: error.message });
    }
}


exports.getProductById = async function (req, res) {
    try {
        const product = await Product.findById(req.params.id).select();
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.json(product);
    } catch (error) {
        console.error(error);
        return res.staus(500).json({ type: error.name, message: error.message });
    }
}
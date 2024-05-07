const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// database set-up starts:
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clusteremajhon.gqhceta.mongodb.net/?retryWrites=true&w=majority&appName=ClusterEmaJhon`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const productsCollection = client.db('emajhon').collection('products');
        console.log("Connected to MongoDB!");

        // CRUD 
        // READ :
        app.get('/product', async (req, res) => {
            // console.log('query', req.query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = productsCollection.find(query);
            let products;
            if (page || size) {
                products = await cursor.skip(page * size).limit(size).toArray();
            } else {
                products = await cursor.toArray();
            }
            res.send(products);
        });
        // READ EACH :
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        });
        // CREATE :
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        });
        // DELETE :
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });
        // UPDATE :
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: updatedProduct.name,
                    category: updatedProduct.category,
                    price: updatedProduct.price,
                    stock: updatedProduct.stock,
                    ratings: updatedProduct.ratings,
                    ratingsCont: updatedProduct.ratingsCount,
                    shipment: updatedProduct.shipment,
                    img: updatedProduct.img,
                    seller: updatedProduct.seller,
                    quantity: updatedProduct.quantity,

                }
            }
            const result = await productsCollection.updateOne(query, updatedDoc, options);
            res.send(result);
        });

        // DB collection Data Count
        app.get('/productCount', async (req, res) => {
            const query = {};
            // const cursor = productsCollection.find(query);
            const count = await productsCollection.countDocuments(query);
            res.send({ count });
        })

        // use post to get products by ids for carts
        app.post('/productByKeys', async (req, res) => {
            const keys = req.body;
            // console.log(keys);
            const ids = keys.map(id => new ObjectId(id));
            const query = { _id: { $in: ids } };
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);

        })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// database set-up ends.


app.get('/', (req, res) => { res.send('Server is running.') });
app.listen(port, () => { console.log('Running on Port : ', port) });

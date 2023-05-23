const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l8fg5tj.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

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
    const toysCollection = client.db('toysDB').collection('toys');

    app.get('/toys', async (req, res) => {
        const cursor = toysCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/toys/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await toysCollection.findOne(query);
        res.send(result);
    })

    app.post('/toys', async (req, res) => {
        const newToys = req.body;
        console.log(newToys);
        const result = await toysCollection.insertOne(newToys);
        res.send(result);
    })

    app.put('/toys/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedToys = req.body;
    
        const toys = {
          $set: {
            name: updatedToys.name,
            quantity: updatedToys.quantity,
            seller: updatedToys.seller,
            rating: updatedToys.rating,
            sub_category: updatedToys.sub_category,
            details: updatedToys.details,
            photo: updatedToys.photo,
            email: updatedToys.email,
            price: updatedToys.price,
          },
        };
    
        const result = await toysCollection.updateOne(filter, toys, options);
    
        if (result.matchedCount > 0) {
          res.json({ message: 'Toys updated successfully' });
        } else {
          res.status(404).json({ error: 'Toys not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating toys' });
      }
    });
    
    

    app.delete('/toys/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await toysCollection.deleteOne(query);
        res.send(result);
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Power Toys server is running')
})

app.listen(port, () => {
    console.log(`Power Toys Server is running on port: ${port}`)
})

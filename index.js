const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@bot.jxczvgl.mongodb.net/?retryWrites=true&w=majority&appName=bot`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    //create a database
    const database = client.db("VisaDB");

    // db collection
    const usersCollection = database.collection("NewVisa");
    const applyVisaCollection = database.collection("ApplyVisa");

    //get requests

    //hello
    app.get("/", (req, res) => {
      res.send("hello");
    });

    app.get("/allvisas", async (req, res) => {
      const allVisa = usersCollection.find();
      const result = await allVisa.toArray();
      res.json(result);
    });

    app.get("/latestvisas", async (req, res) => {
      const latestvisas = usersCollection.find().limit(6);
      const result = await latestvisas.toArray();
      res.json(result);
    });

    app.get("/visadetails/:id", async (req, res) => {
      const id = req.params.id;
      const visaDetails = await usersCollection.findOne({
        _id: new ObjectId(id),
      });
      res.json(visaDetails);
    });

    app.get("/myvisas/:email", async (req, res) => {
      const email = req.params.email;
      const result = await applyVisaCollection.find({ email }).toArray();
      res.json(result);
    });

    app.get("/addedvisas/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.find({ email }).toArray();
      res.json(result);
    });

    //post requests
    app.post("/applyvisa", async (req, res) => {
      const applyVisa = req.body;
      // console.log(applyVisa);
      const result = await applyVisaCollection.insertOne(applyVisa);
      res.send(result);
    });

    app.post("/addvisa", async (req, res) => {
      const newVisa = req.body;
      // console.log(newVisa);
      const result = await usersCollection.insertOne(newVisa);
      res.send(result);
    });

    // delete requests

    app.delete("/rmyapplication/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await applyVisaCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/addedvisadelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // update method
    app.patch("/updatevisa/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);

      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          countryImage: data?.countryImage,
          countryName: data?.countryName,
          visaType: data?.visaType,
          processingTime: data?.processingTime,
          description: data?.description,
          ageRestriction: data?.ageRestriction,
          fee: data?.fee,
          validity: data?.validity,
          applicationMethod: data?.applicationMethod,
        },
      };
      const result = await usersCollection.updateOne(query, update);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

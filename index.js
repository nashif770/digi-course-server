const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
// const stripe = require('stripe')(process.env.PAY_SECRET_KEY)

// TODO:FIX PROCES ENV
require("dotenv").config();

const stripe = require("stripe")(process.env.DB_KEY);

// middleware

app.use(cors());
app.use(express.json());

// mongodb -----------------------------------------------

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri = `mongodb+srv://${process.env.DB_SSUSER}:${process.env.DB_SSPASS}@cluster0.c1krwnm.mongodb.net/?retryWrites=true&w=majority`;
// const uri = `mongodb+srv://digiUser:3Z6ReWkE5te1SVBc@cluster0.c1krwnm.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c1krwnm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    // -----------------------------------------------------------------
    const database = client.db("digiCourse");
    const classesCollection = client.db("digiCourse").collection("courses");
    const myClassesCollection = client
      .db("digiCourse")
      .collection("mySelectedClasses");
    const myEnrolledClassesCollection = client
      .db("digiCourse")
      .collection("myEnrolledClasses");

    // classes --------------------------

    // 1. this end point is used to collect all the courses 
    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });
  // 2. this end point is used for getting the class details
    app.get("/classDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

      // students -----------------------

      // this end point is used to get the selected class in dashboard section
    app.get("/allselectedclasses", async (req, res) => {
      const result = await myClassesCollection.find().toArray();
      res.send(result);
    });

    //this end point is used to post classes in selectedClass database from class page.
    app.post("/myselectedclasses", async (req, res) => {
      const myClass = req.body;
      const result = await myClassesCollection.insertOne(myClass);
      res.send(result);
    });

    //this section is used to get all the selected class by id
    app.get("/myselectedclasses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myClassesCollection.find(query).toArray();
      res.send(result);
    });

    //this is used to get selected class by email
    app.get("/myselectedclasses", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await myClassesCollection.find(query).toArray();
      res.send(result);
    });

    // this is used to remove selected class from database 
    app.delete("/myselectedclasses/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id", id)
      const query = { _id: (id) };
      const result = await myClassesCollection.deleteOne(query);
      res.send(result);
    });

// enrolled section ---------------------------
// this section is used to update selected class to enrolled 
    app.post("/enrolledClass", async (req, res) => {
      const enrollData = req.body;
      const result = await myEnrolledClassesCollection.insertOne(enrollData);
      res.send(result);
    });

    // this is used to get the enrolled class in enrolled class section of dashboard

    app.get("/enrolledClass", async (req, res) => {
      const result = await myEnrolledClassesCollection.find().toArray();
      res.send(result);
    });

    // this section is used to update the enrolled classes to complete
    app.patch("/enrolledClass/:email/:id", async (req, res) => {
      const { email, id } = req.params;
      console.log("Updating class with email:", email, "and ID:", id);
      try {
        const result = await myEnrolledClassesCollection.updateOne(
          { email: email, _id: id },
          { $set: { status: "Complete" } },
          { upsert: true }
        );
        console.log("observing result ",result)
        if (result.modifiedCount === 1) {
          res.status(200).json({ success: true, message: "Status updated successfully" });
        } else {
          res.status(404).json({ success: false, message: "Class not found" });
        }
      } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    });   

    // -----------------------------------------------------------------
    // Send a ping to confirm a successful connection
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

// mongodb -----------------------------------------------

app.get("/", (req, res) => {
  res.send("Students are training");
});

app.listen(port, () => {
  console.log("Students are training in Summer Slam", port);
});

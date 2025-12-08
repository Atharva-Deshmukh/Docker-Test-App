const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");

const PORT = 5050;
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // for JSON body
app.use(express.static("public"));

// MongoDB running in Docker, connect from host
const MONGO_URL = "mongodb://admin:qwerty@localhost:27017/?authSource=admin";
const DB_NAME = "docker-db";
const COLLECTION_NAME = "users";

let client;

// Connect once and reuse
async function connectToMongo() {
  if (!client || !client.isConnected?.()) {
    client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });
    await client.connect();
    console.log("Connected successfully to MongoDB");
  }
  return client.db(DB_NAME);
}

// GET all users
app.get("/getUsers", async (req, res) => {
  try {
    const db = await connectToMongo();
    const users = await db.collection(COLLECTION_NAME).find({}).toArray();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST new user
app.post("/addUser", async (req, res) => {
  try {
    const userObj = req.body;
    const db = await connectToMongo();
    const result = await db.collection(COLLECTION_NAME).insertOne(userObj);
    console.log("Inserted:", result.insertedId);
    res.json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

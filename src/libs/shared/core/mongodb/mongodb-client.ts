const { MongoClient } = require("mongodb");

const user = "wanchangmeng";
const password = "nGbqdChrvpbueRgP";

// Replace the uri string with your connection string.
const uri = `mongodb+srv://${user}:${password}@cluster0.cohi8pa.mongodb.net?retryWrites=true&w=majority`;

export const mongoDbClient = new MongoClient(uri);
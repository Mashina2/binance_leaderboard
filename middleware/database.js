import { MongoClient } from "mongodb";
import nextConnect from "next-connect";

// Middleware setup.
// NOT SECURE - DO NOT PUSH INTO PRODUCTION WITHOUT ADDING ADDITIONAL SECURITY MEASURES
const client = new MongoClient(
  "mongodb://localhost:27017",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
async function database(req, res, next) {
  // console.log(client)
  await client.connect();
  req.dbClient = client;
  req.db = client.db("binance_leaderboard");
  return next();
}

const middleware = nextConnect();
middleware.use(database);
export default middleware;

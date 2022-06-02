import nextConnect from "next-connect";
import middleware from "../../../middleware/database";
const handler = nextConnect();
handler.use(middleware);
handler.get(async (req, res) => {
await req.db.collection('binance').findOne(function(err, result){
    res.status(200).json(result);
  });
});

export default handler;

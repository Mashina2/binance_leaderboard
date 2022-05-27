import middleware from "../../middleware/database";
import nextConnect from "next-connect";
const handler = nextConnect();
handler.use(middleware);

export default async function handler(req, res) {
    
    res.status(200).json({ name: 'John Doe' })
  }
  
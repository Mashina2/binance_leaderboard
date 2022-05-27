const encryptedUid = "E183C1EC8742EEDF845E581699D129E3";
const DELAY = 5000

import createOrder from "../../helpers/listener_helper";

import pnlManager from "binance-leaderboard-listener/libs/pnlManager";
export default function handler(req, res) {
  
    // const listener = pnlManager.listen({
    //     encryptedUid: encryptedUid,
    //     delay: DELAY,
    //     tradeType: "PERPETUAL"
    // })
    // listener.on('update', (data) => {
    //         res.status(200).json({ data: data });
    // });

    createOrder();
  }
  
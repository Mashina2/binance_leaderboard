import { useEffect, useState } from "react";

export default function CloseOrders() {
    let [getOrders, setOrders] = useState();
    useEffect(() => {
        (async () => {
            let orders = await fetch("/api/mongo/get_orders");
            orders = await orders.json();
            orders = orders.data;
        
            let arr = [];
            for (let i in orders) {
                let order = orders[i];
            if(order.status == 1){
                arr.push(
                    <tr 
                    className="w3-animate-bottom"
                    key={order.symbol}
                    >
                        <td>{order.symbol}</td>
                        <td>{order.type}</td>
                        <td>{order.amount}</td>
                        <td>{order.startPrice} </td>
                        <td>{order.endPrice} </td>
                        <td>{order.pnl} </td>
                        <td>{order.roe} </td>
                        {/* <td>{order.openDateTime}</td>
                        <td>{order.closeDateTime}</td> */}
                    </tr>
                )
            }
        }
            setOrders(arr);
        })();
    });

    return (
        <div className="container">
            <h1 className="text-center">Close Orders</h1>
            <div className="table-responsive">
            <table
            className="table"
            >
            <thead>
                <tr>
                <th>Symbol</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Start Price</th>
                <th>End Price</th>
                <th>Profit/Loss</th>
                <th>ROE(%)</th>
                {/* <th>Start Time</th>
                <th>End Time</th> */}
                </tr>
            </thead>
            <tbody>{getOrders}</tbody>
            </table>
            </div>
        </div>
        );
}

import { useEffect, useState } from "react";
import {useRouter} from "next/router";

export default function OrderDetails(props) {
    const { query } = useRouter();
    let order_id = query.order_id;
    let [getOrders, setOrders] = useState();
    useEffect(() => {
        (async () => {
            // let orders = await fetch(`/api/mongo/get_order_details`);
            let orders = await fetch("/api/mongo/get_order_details", {
                method:"POST",
                body:JSON.stringify(order_id)
              });
            orders = await orders.json();
            orders = orders.data;
        
            let arr = [];
            for (let i in orders) {
                let order = orders[i];
            // if(order.status == 0){
                let tableClass = order.status == 0 ? 'table-success':"table-danger";
                arr.push(
                    <tr 
                    className={tableClass}
                    key={order.symbol}
                    >
                        <td>{order.symbol}</td>
                        <td>{order.type}</td>
                        <td>{order.amount}</td>
                        <td>{order.price} </td>
                        <td>{order.closePrice} </td>
                        <td>{order.pnl} </td>
                        <td>{order.roe} </td>
                        <td>{order.isCredit==1?'Credit':"Debit"} </td>
                        <td>{order.status==1?'Close Order':"Open Order"} </td>
                        {/* <td>{order.openDateTime}</td>
                        <td>{order.closeDateTime}</td> */}
                    </tr>
                )
            // }
        }


            setOrders(arr);
        })();
    });

    return (
        <div className="main">
        {/* <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" /> */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"  />
        <div className="container">
            <h1 className="text-center">Open Orders Details</h1>
            <div className="table-responsive">
            <table
            className="table"
            >
            <thead>
                <tr>
                <th>Symbol</th>
                <th>Type</th>
                <th>Amount</th>
                <th> Price</th>
                <th>Close Price</th>
                <th>Profit/Loss</th>
                <th>ROE(%)</th>
                <th>Transaction Type</th>
                <th>Order Status</th>
                {/* <th>Start Time</th>
                <th>End Time</th> */}
                </tr>
            </thead>
            <tbody>{getOrders}</tbody>
            </table>
            </div>
        </div>
        </div>
        );
}

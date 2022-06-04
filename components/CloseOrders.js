import { useEffect, useState } from "react";
import { useRouter } from 'next/router'

export default function CloseOrders() {
    let [getOrders, setOrders] = useState();
const router = useRouter();
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
                        <td>{order.lbamount != undefined?order.lbamount:""}</td>
                        <td>{order.lbentryPrice != undefined?order.lbentryPrice:""}</td>
                        <td>{order.lbsize != undefined?order.lbsize:""}</td>
                        {/* <td>{order.openDateTime}</td>
                        <td>{order.closeDateTime}</td> */}
                        <td id={order._id}><a  className="btn btn-sm btn-success" onClick={ViewDetails} value="view" ><i className="fas fa-eye"></i></a></td>

                    </tr>
                )
		function ViewDetails(e) {
                    e.preventDefault();
                    router.push(`/close_order_details?order_id=${order._id}`);
                  }
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
                <th>USDT Amount</th>
                <th>LB Entry Price</th>
                <th>LB Size</th>
                {/* <th>Start Time</th>
                <th>End Time</th> */}
		<th>Action</th>
                </tr>
            </thead>
            <tbody>{getOrders}</tbody>
            </table>
            </div>
        </div>
        );
}

import {connect} from '../connect';
import OrderBook from './OrderBook';

export interface OrderBookProps {
  orders?: any[];
}

export interface OrderBookItemProps {
  ask: number;
  bestBid: boolean;
  bid: number;
  id: number;
  price: number;
  maxVolume: number;
}

const ConnectedOrderBook = connect(
  ({orderBookStore: {allOrders: orders}}) => ({
    orders
  }),
  OrderBook
);

export {ConnectedOrderBook as OrderBook};
export {default as OrderBookItem} from './OrderBookItem/OrderBookItem';

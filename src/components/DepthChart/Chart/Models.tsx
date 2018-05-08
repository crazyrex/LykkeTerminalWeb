import {AssetModel, Order} from '../../../models';

export interface ChartProps {
  asks: Order[];
  bids: Order[];
  mid: number;
  baseAsset: AssetModel;
  quoteAsset: AssetModel;
  width: number;
  height: number;
  quoteAccuracy: number;
  baseAccuracy: number;
  selectedInstrument?: any;
}

export interface PointerProps {
  orders: Order[];
  side: string;
  points: number[];
  borders: number[];
  color: string;
  baseAsset: AssetModel;
  quoteAsset: AssetModel;
  width: number;
  height: number;
  quoteAccuracy: number;
  baseAccuracy: number;
}

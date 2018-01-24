import {defaultTo} from 'rambda';
import * as React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import styled from 'styled-components';
import {Order} from '../../models';
import {Table} from '../Table/index';
import {OrderBookItem} from './';

const Wrapper = styled.div`
  height: 100%;
  margin-right: -0.9375rem;
`;

const StyledHead = styled.thead`
  display: block;
  position: absolute;
  width: 100%;
  left: 0;
  background: #333;
  z-index: 1;
`;

const StyledRow = styled.tr`
  display: flex;
  justify-content: space-evenly;
`;

const StyledSellOrders = styled.tbody`
  display: block;
  margin: 34px 0.9375rem 0 0;
`;

const StyledBuyOrders = styled(StyledSellOrders)`
  margin: 0 0.9375rem 0 0;
`;

const StyledMidPrice = styled.tbody`
  display: flex;
  justify-content: center;
  margin: 0 0.9375rem 0 0;
  background: rgba(0, 0, 0, 0.2);
`;

const StyledHeader = styled.th`
  flex-grow: 1;
  text-align: ${(p: any) => p.align} !important;
` as any;

interface OrderBookProps {
  asks: Order[];
  bids: Order[];
  mid: number;
}

class OrderBook extends React.Component<OrderBookProps> {
  private scrollComponent: any;
  private wrapper: any;
  private content: any;

  private refHandlers = {
    content: (innerRef: any) => (this.content = innerRef),
    scrollComponent: (ref: any) => (this.scrollComponent = ref),
    wrapper: (innerRef: any) => (this.wrapper = innerRef)
  };

  private isScrollSet: boolean = false;

  componentDidUpdate() {
    if (this.isScrollSet) {
      return;
    }

    const scroll = (this.content.offsetHeight - this.wrapper.offsetHeight) / 2;
    this.scrollComponent.scrollTop(scroll > 0 ? scroll : 0);

    if (this.props.asks.length && this.props.bids.length && scroll > 0) {
      this.isScrollSet = true;
    }
  }

  render() {
    return (
      <Wrapper innerRef={this.refHandlers.wrapper}>
        <Table>
          <StyledHead>
            <StyledRow>
              <StyledHeader align="right">Sell</StyledHeader>
              <StyledHeader align="center">Price</StyledHeader>
              <StyledHeader align="left">Buy</StyledHeader>
            </StyledRow>
          </StyledHead>
        </Table>
        <Scrollbars autoHide={true} ref={this.refHandlers.scrollComponent}>
          <Table innerRef={this.refHandlers.content}>
            <StyledSellOrders>
              {this.props.asks.map(order => (
                <OrderBookItem key={order.id} {...order} />
              ))}
            </StyledSellOrders>
            <StyledMidPrice>
              <tr>
                <td>{defaultTo('', Number(this.props.mid))}</td>
              </tr>
            </StyledMidPrice>
            <StyledBuyOrders>
              {this.props.bids.map(order => (
                <OrderBookItem key={order.id} {...order} />
              ))}
            </StyledBuyOrders>
          </Table>
        </Scrollbars>
      </Wrapper>
    );
  }
}

export default OrderBook;

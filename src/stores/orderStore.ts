import OrderApi from '../api/orderApi';
import * as topics from '../api/topics';
import ModalMessages from '../constants/modalMessages';
import levels from '../constants/notificationLevels';
import messages from '../constants/notificationMessages';
import {OrderModel, OrderType} from '../models';
import Types from '../models/modals';
import {OrderStatus} from '../models/orderType';
import {capitalize} from '../utils';
import {getRestErrorMessage} from '../utils/string';
import {BaseStore, RootStore} from './index';
import ModalStore from './modalStore';
import NotificationStore from './notificationStore';

// tslint:disable:no-console
class OrderStore extends BaseStore {
  private readonly modalStore: ModalStore;
  private readonly notificationStore: NotificationStore;
  private updatePriceByOrderBook: any;
  private updateDepthByOrderBook: any;

  constructor(store: RootStore, private readonly api: OrderApi) {
    super(store);
    this.notificationStore = this.rootStore.notificationStore;
    this.modalStore = this.rootStore.modalStore;
  }

  updatePriceFn = (fn: any) => {
    this.updatePriceByOrderBook = fn;
  };

  updateDepthFn = (fn: any) => {
    this.updateDepthByOrderBook = fn;
  };

  updatePrice = (price: number) => {
    if (this.updatePriceByOrderBook) {
      this.updatePriceByOrderBook(price);
    }
  };

  updateDepth = (quantity: number) => {
    if (this.updateDepthByOrderBook) {
      this.updateDepthByOrderBook(quantity);
    }
  };

  updatePriceAndDepth = (price: number, quantity: number) => {
    this.updatePrice(price);
    this.updateDepth(quantity);
  };

  placeOrder = async (orderType: string, body: any) => {
    switch (orderType) {
      case OrderType.Market:
        return (
          this.api
            .placeMarket(body)
            // tslint:disable-next-line:no-empty
            .then(() => {}, this.orderPlacedUnsuccessfully)
        );
      case OrderType.Limit:
        return (
          this.api
            .placeLimit(body)
            // tslint:disable-next-line:no-empty
            .then((orderId: any) => {
              const addedOrder = this.rootStore.orderListStore.addOrder({
                Id: orderId,
                CreateDateTime: new Date(),
                OrderAction: capitalize(body.OrderAction),
                Volume: body.Volume,
                RemainingVolume: body.Volume,
                Price: body.Price,
                AssetPairId: body.AssetPairId
              });
              if (addedOrder) {
                this.orderPlacedSuccessfully();
              }
            }, this.orderPlacedUnsuccessfully)
        );
    }
  };

  editOrder = async (body: any, id: string) =>
    this.api
      .cancelOrder(id)
      .then(() => this.api.placeLimit(body))
      .catch(this.orderPlacedUnsuccessfully);

  cancelOrder = async (id: string) => {
    await this.api.cancelOrder(id);
    const deletedOrder = this.rootStore.orderListStore.deleteOrder(id);
    if (deletedOrder) {
      this.orderCancelledSuccessfully(id);
    }
  };

  cancelAll = () =>
    this.rootStore.orderListStore.limitOrders
      .map((o: OrderModel) => o.id)
      .forEach(this.cancelOrder);

  subscribe = (ws: any) => {
    ws.subscribe(topics.orders, this.onOrders);
  };

  onOrders = (args: any) => {
    const order = args[0][0];
    switch (order.Status) {
      case OrderStatus.Cancelled:
        const deleteOrder = this.rootStore.orderListStore.deleteOrder(order.Id);
        if (deleteOrder) {
          this.orderCancelledSuccessfully(order.Id);
        }
        break;
      case OrderStatus.Matched:
        this.rootStore.orderListStore.deleteOrder(order.Id);
        this.orderClosedSuccessfully(order.Id);
        break;
      case OrderStatus.Processing:
        this.rootStore.orderListStore.addOrUpdateOrder(order);
        this.orderPartiallyClosedSuccessfully(order.Id, order.RemainingVolume);
        break;
      case OrderStatus.Placed:
        const isAdded = this.rootStore.orderListStore.addOrder(order);
        if (isAdded) {
          this.orderPlacedSuccessfully();
        }
        break;
    }
  };

  reset = () => {
    return;
  };

  private orderClosedSuccessfully = (orderId: string) => {
    this.notificationStore.addNotification(
      levels.success,
      messages.orderExecuted(orderId)
    );
  };

  private orderPartiallyClosedSuccessfully = (
    orderId: string,
    orderVolume: number
  ) => {
    this.notificationStore.addNotification(
      levels.success,
      messages.orderExecutedPartially(orderId, orderVolume)
    );
  };

  private orderPlacedSuccessfully = () => {
    this.notificationStore.addNotification(
      levels.success,
      messages.orderSuccess
    );
  };

  private orderCancelledSuccessfully = (orderId: string) => {
    this.notificationStore.addNotification(
      levels.information,
      `${messages.orderCancelled} ${orderId}`
    );
  };

  private orderPlacedUnsuccessfully = (error: any) => {
    console.error(error);

    const needConfirmation =
      error.status === 400 &&
      error.message &&
      JSON.parse(error.message).Confirmation;

    if (needConfirmation) {
      this.modalStore.addModal(
        ModalMessages.expired,
        null,
        null,
        Types.Expired
      );
      return;
    }

    let message;
    try {
      message = JSON.parse(error.message).ME || JSON.parse(error.message);
      message = getRestErrorMessage(message);
    } catch (e) {
      message = !!error.message.length ? error.message : messages.defaultError;
      if (JSON.parse(message).BackupDone.length) {
        message = JSON.parse(message).BackupDone[0];
      }
    }

    this.notificationStore.addNotification(levels.error, `${message}`);
  };
}

export default OrderStore;

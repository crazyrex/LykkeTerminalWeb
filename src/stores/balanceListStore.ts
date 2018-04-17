import {computed, observable, runInAction} from 'mobx';
import {add, pathOr} from 'rambda';
import {BalanceListApi} from '../api/index';
import {default as storageKeys} from '../constants/storageKeys';
import keys from '../constants/tradingWalletKeys';
import tradingWalletKeys from '../constants/tradingWalletKeys';
import {AssetBalanceModel, WalletModel} from '../models';
import MarketService from '../services/marketService';
import {StorageUtils} from '../utils/index';
import {BaseStore, RootStore} from './index';

const baseAssetStorage = StorageUtils(storageKeys.baseAsset);

class BalanceListStore extends BaseStore {
  @computed
  get getWalletsWithPositiveBalances() {
    return this.walletList
      .filter(b => b.totalBalance > 0)
      .sort((a, b) => b.totalBalance - a.totalBalance);
  }

  @computed
  get getBalances() {
    return this.walletList
      .filter(b => b.totalBalance > 0)
      .sort((a, b) => b.totalBalance - a.totalBalance);
  }

  @computed
  get totalBalance() {
    return this.walletList.map(b => b.totalBalance).reduce(add, 0);
  }

  @computed
  get availableBalance() {
    return this.tradingAssets.filter((a: AssetBalanceModel) => a.name);
  }

  @computed
  get tradingWalletAssets() {
    return this.tradingAssets.filter((a: AssetBalanceModel) => !!a.balance);
  }

  @computed
  get tradingWalletTotal() {
    return this.tradingTotal;
  }

  @observable currentWalletId: string;

  @computed
  get currentWallet() {
    return (
      this.walletList.find(w => w.id === this.currentWalletId) ||
      this.walletList.find(w => w.type === tradingWalletKeys.trading)
    );
  }

  @observable.shallow private walletList: WalletModel[] = [];
  @observable.shallow private tradingAssets: AssetBalanceModel[] = [];
  @observable private tradingTotal: number = 0;

  constructor(store: RootStore, private readonly api: BalanceListApi) {
    super(store);
  }

  fetchAll = () => {
    return this.api
      .fetchAll()
      .then((resp: any) => {
        runInAction(() => {
          const balanceList = resp.map(
            (wallet: any) => new WalletModel(wallet)
          );
          this.updateBalance(balanceList);
          this.setTradingAssets(balanceList);
        });
        return Promise.resolve();
      })
      .catch(Promise.reject);
  };

  updateBalance = async (walletList: WalletModel[] = this.walletList) => {
    const promises = walletList.map(balanceList =>
      balanceList.update(this.rootStore.referenceStore)
    );
    await Promise.all(promises);
    this.walletList = [...walletList];
  };

  setTradingAssets = async (walletList: WalletModel[]) => {
    const notFoundAssets: string[] = [];
    const {getAssetById} = this.rootStore.referenceStore;
    this.tradingAssets = this.getTradingWallet(walletList).balances.map(
      (dto: any) => {
        const assetBalance = new AssetBalanceModel(dto);
        const assetById = getAssetById(assetBalance.id);
        if (!assetById) {
          notFoundAssets.push(assetBalance.id);
        }
        assetBalance.name = pathOr('', ['name'], assetById);
        assetBalance.accuracy = pathOr('', ['accuracy'], assetById);
        return assetBalance;
      }
    );

    await this.updateWithAssets(notFoundAssets);
    await this.updateTradingWallet();
  };

  changeWallet = (walletId: string) => {
    this.currentWalletId = walletId;
  };

  updateWithAssets = async (ids: string[]) => {
    const promises: any = [];
    const {getAssetById, fetchAssetById} = this.rootStore.referenceStore;
    ids.forEach(id => {
      promises.push(fetchAssetById(id));
    });
    return Promise.all(promises).then(() => {
      ids.forEach(id => {
        this.tradingAssets.forEach(asset => {
          if (asset.id === id) {
            const assetById = getAssetById(asset.id);
            asset.name = pathOr('', ['name'], assetById);
            asset.accuracy = pathOr('', ['accuracy'], assetById);
          }
        });
      });
    });
  };

  updateTradingWallet = async () => {
    const baseAssetId = baseAssetStorage.get();

    this.tradingAssets = this.tradingAssets.map(a => {
      a.balanceInBaseAsset = MarketService.convert(
        a.balance,
        a.id,
        baseAssetId!,
        this.rootStore.referenceStore.getInstrumentById
      );
      return a;
    });
    this.tradingTotal = this.tradingAssets
      .map(b => b.balanceInBaseAsset)
      .reduce(add, 0);
  };

  subscribe = (session: any) => {
    session.subscribe(`balances`, this.onUpdateBalance);
  };

  onUpdateBalance = async () => {
    this.fetchAll();
  };

  reset = () => {
    this.walletList = [];
    this.tradingAssets = [];
  };

  private getTradingWallet = (walletList: WalletModel[]) => {
    return walletList.find(b => b.type === keys.trading)!;
  };
}

export default BalanceListStore;

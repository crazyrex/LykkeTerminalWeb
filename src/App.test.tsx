import {Provider} from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import {RootStore} from './stores/index';

const rootStore = new RootStore();
rootStore.watchlistStore.fetchAll();
rootStore.tradeListStore.fetchAll();
rootStore.orderBookStore.fetchAll();
rootStore.balanceListStore.fetchAll();
rootStore.orderListStore.fetchAll();

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider {...rootStore}>
      <App />
    </Provider>,
    div
  );
});
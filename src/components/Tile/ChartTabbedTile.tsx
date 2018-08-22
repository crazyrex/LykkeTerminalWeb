import {observable} from 'mobx';
import {equals} from 'rambda';
import * as React from 'react';
import {AnalyticsEvents} from '../../constants/analyticsEvents';
import {ChartType} from '../../models';
import {AnalyticsService} from '../../services/analyticsService';
import {PriceChart} from '../Chart/index';
import DepthChart from '../DepthChart';
import {TileContent, TileHeader, TileTab} from './styles';
import {TileProps} from './Tile';

interface ChartTabbedTileProps extends TileProps {
  tabs: string[];
}

class ChartTabbedTile extends React.Component<ChartTabbedTileProps> {
  @observable selectedTab = ChartType.Price;

  handleSelectTab = (tab: ChartType) => () => {
    this.selectedTab = tab;

    AnalyticsService.track(AnalyticsEvents.ChartTypeSwitched(tab));
  };

  render() {
    const {tabs = []} = this.props;

    return (
      <React.Fragment>
        <TileHeader>
          {tabs.map((tab: ChartType) => (
            <TileTab
              key={tab}
              selected={equals(tab, this.selectedTab)}
              onClick={this.handleSelectTab(tab)}
            >
              {tab}
            </TileTab>
          ))}
        </TileHeader>

        <TileContent
          style={{
            display: this.selectedTab === ChartType.Price ? 'block' : 'none'
          }}
          className="chart-tile"
        >
          <PriceChart />
        </TileContent>

        {this.selectedTab === ChartType.Depth && (
          <TileContent className="chart-tile">
            <DepthChart />
          </TileContent>
        )}
      </React.Fragment>
    );
  }
}

export default ChartTabbedTile;

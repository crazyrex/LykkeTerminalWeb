import * as React from 'react';
import {Dictionary} from '../../types';
import {formattedNumber} from '../../utils/localFormatted/localFormatted';
import {HeaderItem} from '../Header/styles';
import {ThemeObject} from '../styled';
import {
  InstrumentPerformanceFigureLabel,
  InstrumentPerformanceFigureValue,
  StyledInstrumentPerformance,
  StyledInstrumentPerformanceFigure
} from './styles';

const colorFromChange = (change: number, colors: Dictionary<string>) =>
  Number.isFinite(change)
    ? change === 0
      ? undefined
      : change > 0
        ? colors.changePositivePerformanceText
        : colors.changeNegativePerformanceText
    : undefined;

const mapToPercentageWithAccuracy = (acc: number) => (val: number) =>
  `${val >= 0 ? '+' : ''}${formattedNumber(val, acc).concat('%')}`;

const mapToPercentage = mapToPercentageWithAccuracy(2);

export interface InstrumentPerformanceProps {
  lastPrice: number;
  change: number;
  high: number;
  low: number;
  volume: number;
  instrumentAccuracy: number;
  baseAssetAccuracy: number;
  showPerformance: boolean;
  theme: ThemeObject;
}

interface InstrumentPerformanceFigureProps {
  label: string;
  value: number;
  accuracy: number;
  show: boolean;
  color?: string;
  valueFormatter?: (value: number | string) => string;
}

const InstrumentPerformanceFigure: React.SFC<
  InstrumentPerformanceFigureProps
> = ({label = '', value, accuracy, color, valueFormatter, show}) => (
  <HeaderItem>
    <StyledInstrumentPerformanceFigure>
      <InstrumentPerformanceFigureValue color={color}>
        {show && value && Number.isFinite(value)
          ? valueFormatter
            ? valueFormatter(value)
            : formattedNumber(value, accuracy)
          : '--'}
      </InstrumentPerformanceFigureValue>
      <InstrumentPerformanceFigureLabel>
        {label}
      </InstrumentPerformanceFigureLabel>
    </StyledInstrumentPerformanceFigure>
  </HeaderItem>
);

const InstrumentPerformance: React.SFC<InstrumentPerformanceProps> = ({
  lastPrice,
  change,
  high,
  low,
  volume,
  instrumentAccuracy = 2,
  baseAssetAccuracy = 2,
  showPerformance,
  theme
}) => (
  <StyledInstrumentPerformance>
    <InstrumentPerformanceFigure
      label="Last price"
      value={lastPrice}
      accuracy={instrumentAccuracy}
      show={showPerformance}
    />
    <InstrumentPerformanceFigure
      label="Change (24h)"
      value={change}
      valueFormatter={mapToPercentage}
      color={colorFromChange(change, theme.colors)}
      accuracy={instrumentAccuracy}
      show={showPerformance}
    />
    <InstrumentPerformanceFigure
      label="High (24h)"
      value={high}
      accuracy={instrumentAccuracy}
      show={showPerformance}
    />
    <InstrumentPerformanceFigure
      label="Low (24h)"
      value={low}
      accuracy={instrumentAccuracy}
      show={showPerformance}
    />
    <InstrumentPerformanceFigure
      label="Volume (24h)"
      value={volume}
      accuracy={baseAssetAccuracy}
      show={showPerformance}
    />
  </StyledInstrumentPerformance>
);

export default InstrumentPerformance;

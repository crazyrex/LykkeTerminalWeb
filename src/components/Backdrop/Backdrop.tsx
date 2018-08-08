import * as React from 'react';
import styled from 'styled-components';

const StyledBackdrop = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.theme.colors.backdropBackground};
  opacity: 0.7;
  position: absolute;
  z-index: 30;
`;

const Backdrop: React.SFC = () => {
  return <StyledBackdrop />;
};

export default Backdrop;

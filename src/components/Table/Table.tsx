import styled from '../styled';

const Table = styled.table`
  width: 100%;
  th {
    text-align: right;
    padding: 10px 5px;
    color: #8c94a0;
    &:first-child {
      text-align: left;
    }
  }
  td {
    padding: 10px 5px;
    font-weight: 400;
    text-align: right;
    &:first-child {
      color: #fff;
      font-weight: 600;
      text-align: left;
    }
  }
`;

export default Table;
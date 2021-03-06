import React, { useRef, useLayoutEffect, useState } from 'react';
import { Asset } from '@burner-wallet/types';
import styled from 'styled-components';
import { toBN } from 'web3-utils';

const SPEED = 4; // The higher this number is, the slower the balance will refresh

interface BalanceItemProps {
  asset: Asset;
  balance?: string | null;
  growthRate: string;
}

const BalanceCard = styled.div`
  display: inline-flex;
  vertical-align: middle;
  font-size: 48px;
  font-weight: 400;
  text-align: right;
  padding: 8px 16px 8px 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  min-width: 225px;
  background: white;

  &:not(:first-of-type) {
    margin-left: 12px;
  }
`;

const BalanceText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: right;
`;

const Value = styled.div`
  font-size: 48px;
  display: flex;
  justify-content: flex-end;

  & .digit {
    width: 30px;
    text-align: center;
  }
`;

const AssetName = styled.div`
  font-size: 16px;
`;

const Icon = styled.div`
  min-width: 60px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
`;

const getValue = (asset: Asset, balance?: string | null) => {
  if (!balance) {
    return '-';
  }
  try {
    const usdVal = asset.getUSDValue(balance);
    return `$${parseFloat(usdVal).toFixed(2)}`;
  } catch (e) {
    const displayVal = asset.getDisplayValue(balance);
    return parseFloat(displayVal).toFixed(2);
  }
};

const BalanceItem: React.FC<BalanceItemProps> = ({ asset, balance, growthRate }) => {
  const valueDiv = useRef<HTMLDivElement | null>(null);

  const value = getValue(asset, balance);

  useLayoutEffect(() => {
    if (!balance || growthRate === '0') {
      return;
    }

    const startTime = Date.now();
    let req: any;
    let frame = 0;
    const updateNum = () => {
      if (valueDiv.current && frame++ % SPEED === 0) {
        const timeDiff = (Date.now() - startTime).toString();
        const valueDiff = toBN(growthRate).mul(toBN(timeDiff)).div(toBN('1000'));
        const newBalance = toBN(balance).add(valueDiff).toString();
        const displayVal = getValue(asset, newBalance);

        valueDiv.current.innerHTML = Array.from(displayVal)
          .map((char: string) => `<div ${char !== '.' ? 'class="digit"' : ''}>${char}</div>`)
          .join('');
      }

      req = window.requestAnimationFrame(updateNum);
    };
    updateNum();
    return () => void window.cancelAnimationFrame(req);
  }, [balance, asset, growthRate]);

  return (
    <BalanceCard>
      {asset.icon && (
        <Icon style={{ backgroundImage: `url('${asset.icon}')` }} />
      )}
      <BalanceText>
        <Value ref={valueDiv}>
          {Array.from(value).map((char: string, index: number) => (
            <div className={char !== '.' ? 'digit' : ''} key={index}>{char}</div>
          ))}
        </Value>
        <AssetName>{asset.name}</AssetName>
      </BalanceText>
    </BalanceCard>
  );
}

export default BalanceItem;

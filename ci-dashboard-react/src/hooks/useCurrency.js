import { useContext } from 'react';
import { CurrencyContext } from '../App';

export function useCurrency() {
  const { currency, rates } = useContext(CurrencyContext);
  const { symbol, rate } = rates[currency];
  const fmt = (gbpValue) => `${symbol}${(gbpValue * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return { symbol, rate, fmt, currency };
}
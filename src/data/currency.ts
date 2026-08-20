import nigeriaFlag from '../assets/nigeria-flag.svg';
import kenyaFlag from '../assets/kenya-flag.svg';
import americanFlag from '../assets/american-flag.svg';
import britishFlag from '../assets/british-flag.svg';
import ghanaFlag from '../assets/ghana-flag.svg';
import btc from '../assets/coins/BTC.svg';
import eth from '../assets/coins/ETH.svg';
import usdt from '../assets/coins/USDT.svg';
import usdc from '../assets/coins/USDC.svg';
import sol from '../assets/coins/SOL.svg';

const icons: Record<string, string> = {
  NGN: nigeriaFlag,
  KES: kenyaFlag,
  USD: americanFlag,
  GBP: britishFlag,
  GHS: ghanaFlag,
  BTC: btc,
  ETH: eth,
  USDT: usdt,
  USDC: usdc,
  SOL: sol,
};

// the pairs endpoint lists far more coins than we hold artwork for, so the
// rest get a tinted monogram keyed off the code, which stays stable per coin
const tints = ['#0c2801', '#4a5d3a', '#2f6f4e', '#3d5a80', '#6b4f3a', '#5c4b8a'];

export function currencyIcon(code: string): string | undefined {
  return icons[code];
}

export function currencyTint(code: string): string {
  let hash = 0;
  for (const ch of code) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return tints[hash % tints.length];
}

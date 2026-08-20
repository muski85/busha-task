import nigeriaFlag from '../assets/nigeria-flag.svg';
import kenyaFlag from '../assets/kenya-flag.svg';
import americanFlag from '../assets/american-flag.svg';
import britishFlag from '../assets/british-flag.svg';

export interface Account {
  code: string;
  name: string;
  flag: string;
  balance: string;
  value: string;
}

export const accounts: Account[] = [
  { code: 'NGN', name: 'Nigeria Naira',   flag: nigeriaFlag,  balance: '50,900,390.02 NGN', value: '50,900,390.02 NGN' },
  { code: 'KES', name: 'Kenya Shillings', flag: kenyaFlag,    balance: '20,090.78 KES',     value: '226,981.14 NGN' },
  { code: 'USD', name: 'US Dollars',      flag: americanFlag, balance: '8,930.90 USD',      value: '13,655,022.00 NGN' },
  { code: 'GBP', name: 'British Pounds',  flag: britishFlag,  balance: '21,903.93 GBP',     value: '44,038,460.77 NGN' },
];
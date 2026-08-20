import nigeriaFlag from '../assets/nigeria-flag.svg';
import kenyaFlag from '../assets/kenya-flag.svg';
import americanFlag from '../assets/american-flag.svg';
import britishFlag from '../assets/british-flag.svg';

// Only four flags exist as assets. Anything else (GHS and the crypto
// currencies) falls back to a monogram, so the table stays complete without
// inventing artwork.
const icons: Record<string, string> = {
  NGN: nigeriaFlag,
  KES: kenyaFlag,
  USD: americanFlag,
  GBP: britishFlag,
};

export function currencyIcon(code: string): string | undefined {
  return icons[code];
}

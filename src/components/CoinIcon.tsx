import { currencyIcon, currencyTint } from '../data/currency';

interface CoinIconProps {
  code: string;
  size?: number;
}

/** Real mark where we have one, tinted monogram otherwise. */
export default function CoinIcon({ code, size = 32 }: CoinIconProps) {
  const src = currencyIcon(code);

  if (src) {
    return (
      <img
        className="coin-icon"
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className="coin-icon coin-icon--mono"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: currencyTint(code),
        fontSize: Math.max(8, size * 0.28),
      }}
    >
      {code.slice(0, 4)}
    </span>
  );
}

import { useEffect, useRef } from "react";
import type { Balance } from "../lib/busha";
import { formatAmount } from "../lib/busha";
import CoinIcon from "../components/CoinIcon";
import type { PriceMap } from "../data/prices";
import moreIcon from "../assets/dot.svg";
import arrowDown from "../assets/arrow-down.svg";
import bankNote from "../assets/bank-note.svg";
import refresh from "../assets/refresh.svg";
import arrowRight from "../assets/arrow-right.svg";

interface AccountRowProps {
  balance: Balance;
  price?: PriceMap[string];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onConvert: (currency: string) => void;
}

const menuItems = [
  { label: "Deposit", icon: arrowDown },
  { label: "Withdraw", icon: bankNote },
  { label: "Convert", icon: refresh },
];

export default function AccountRow({
  balance,
  price,
  isOpen,
  onToggle,
  onClose,
  onConvert,
}: AccountRowProps) {
  const cellRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (cellRef.current && !cellRef.current.contains(e.target as Node))
        onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  const held = formatAmount(balance.available.amount, balance.currency);
  // what the holding is worth, shown under the balance
  const worth = balance.available.fiat
    ? formatAmount(balance.available.fiat.amount, balance.available.fiat.currency)
    : held;
  // what one unit costs right now, shown in the value column
  const unitPrice = price ? formatAmount(price.amount, price.currency) : '—';

  return (
    <tr className="account-row">
      <td>
        <div className="account-name-cell">
          <CoinIcon code={balance.currency} size={32} />
          <div>
            <div className="account-code">{balance.currency}</div>
            <div className="account-sub">{balance.name}</div>
          </div>
        </div>
      </td>
      <td className="cell-amount">
        <div>{held}</div>
        {worth !== held && <div className="cell-subvalue">{worth}</div>}
      </td>
      <td className="cell-value cell-amount">{unitPrice}</td>
      <td
        className={`account-menu-cell${isOpen ? " is-open" : ""}`}
        ref={cellRef}
      >
        <button
          type="button"
          className="account-menu-btn"
          aria-label="More"
          onClick={onToggle}
        >
          <img src={moreIcon} alt="" width="14" height="14" />
        </button>
        {isOpen && (
          <div className="row-menu">
            <div className="row-menu-list">
              {menuItems.map((item) => (
                <button
                  type="button"
                  className="row-menu-item"
                  key={item.label}
                  onClick={() => {
                    onClose();
                    if (item.label === "Convert") onConvert(balance.currency);
                  }}
                >
                  <img className="row-menu-icon" src={item.icon} alt="" />
                  <span>{item.label}</span>
                  <img
                    className="row-menu-chevron"
                    src={arrowRight}
                    alt="arrow-right"
                    width="14"
                    height="14"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}

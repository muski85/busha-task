import { useEffect, useRef } from "react";
import type { Account } from "../data/account";
import moreIcon from "../assets/dot.svg";
import arrowDown from "../assets/arrow-down.svg";
import bankNote from "../assets/bank-note.svg";
import refresh from "../assets/refresh.svg";
import arrowRight from "../assets/arrow-right.svg";

interface AccountRowProps {
  account: Account;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const menuItems = [
  { label: "Deposit", icon: arrowDown },
  { label: "Withdraw", icon: bankNote },
  { label: "Convert", icon: refresh },
];

export default function AccountRow({
  account,
  isOpen,
  onToggle,
  onClose,
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

  return (
    <tr className="account-row">
      <td>
        <div className="account-name-cell">
          <img className="account-flag" src={account.flag} alt="" />
          <div>
            <div className="account-code">{account.code}</div>
            <div className="account-sub">{account.name}</div>
          </div>
        </div>
      </td>
      <td className="cell-amount">
        <div>{account.balance}</div>
        {account.value !== account.balance && (
          <div className="cell-subvalue">{account.value}</div>
        )}
      </td>
      <td className="cell-value cell-amount">{account.value}</td>
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
                  onClick={onClose}
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
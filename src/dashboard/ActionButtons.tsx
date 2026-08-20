import { useEffect, useRef, useState } from "react";
import "./ActionButtons.css";
import type { ConvertMode } from "../convert/ConvertModal";
import tradeIcon from "../assets/trade.svg";
import depositIcon from "../assets/deposit.svg";
import sendIcon from "../assets/send.svg";
import moreIcon from "../assets/more.svg";
import arrowRight from "../assets/arrow-right.svg";

const icons: Record<string, string> = {
  trade: tradeIcon,
  deposit: depositIcon,
  send: sendIcon,
  more: moreIcon,
};

const actions = [
  { id: "trade", label: "Trade", primary: true },
  { id: "deposit", label: "Deposit" },
  { id: "send", label: "Send" },
  { id: "more", label: "More" },
];

// all three run the same quote -> transfer call, only the currencies differ
const tradeMenu: { mode: ConvertMode; label: string; hint: string }[] = [
  { mode: "buy", label: "Buy", hint: "Buy crypto with cash" },
  { mode: "sell", label: "Sell", hint: "Sell crypto for cash" },
  { mode: "convert", label: "Convert", hint: "Convert one currency to another" },
];

interface ActionButtonsProps {
  onTrade: (mode: ConvertMode) => void;
  onDeposit: () => void;
}

const ActionButtons = ({ onTrade, onDeposit }: ActionButtonsProps) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div className="actions" ref={wrapRef}>
      {actions.map((a) => (
        <div key={a.id} className="action-wrap">
          <button
            type="button"
            className="action"
            aria-haspopup={a.id === "trade" ? "menu" : undefined}
            aria-expanded={a.id === "trade" ? open : undefined}
            onClick={
              a.id === "trade"
                ? () => setOpen((v) => !v)
                : a.id === "deposit"
                  ? onDeposit
                  : undefined
            }
          >
            <span
              className={
                a.primary ? "action-btn action-btn--primary" : "action-btn"
              }
            >
              <img src={icons[a.id]} alt="" />
            </span>
            <span
              className={
                a.primary ? "action-label action-label--primary" : "action-label"
              }
            >
              {a.label}
            </span>
          </button>

          {a.id === "trade" && open && (
            <div className="trade-menu" role="menu">
              {tradeMenu.map((item) => (
                <button
                  key={item.mode}
                  type="button"
                  role="menuitem"
                  className="trade-menu-item"
                  onClick={() => {
                    setOpen(false);
                    onTrade(item.mode);
                  }}
                >
                  <span className="trade-menu-text">
                    <span className="trade-menu-label">{item.label}</span>
                    <span className="trade-menu-hint">{item.hint}</span>
                  </span>
                  <img src={arrowRight} alt="" width="14" height="14" />
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ActionButtons;

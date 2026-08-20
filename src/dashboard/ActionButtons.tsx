import "./ActionButtons.css";
import tradeIcon from "../assets/trade.svg";
import depositIcon from "../assets/deposit.svg";
import sendIcon from "../assets/send.svg";
import moreIcon from "../assets/more.svg";

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

const ActionButtons = () => {
  return (
    <div className="actions">
      {actions.map((a) => (
        <button key={a.id} type="button" className="action">
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
      ))}
    </div>
  );
};

export default ActionButtons;

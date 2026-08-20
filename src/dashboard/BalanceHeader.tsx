import balanceInfoIcon from "../assets/circle-eyes.svg";
import greenArrowUp from "../assets/greenarrow-up.svg";

const BalanceHeader = () => {
  return (
    <div className="balance">
      <div className="balance-label">
        Total balance
        <img src={balanceInfoIcon} alt="" width="14" height="14" />
      </div>
      <div className="balance-amount">
        ₦124,383,938<span className="balance-decimal">.00</span>
      </div>
      <div className="balance-delta">
        <span className="balance-delta-amount">+₦200,053.44</span>
        <img src={greenArrowUp} alt="" width="16" height="16" />
        <span className="balance-delta-pct">8.22%</span>
      </div>
    </div>
  );
};

export default BalanceHeader;

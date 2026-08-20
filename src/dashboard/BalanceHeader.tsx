import type { Balance } from "../lib/busha";
import { amountParts, sumAmounts } from "../lib/busha";
import balanceInfoIcon from "../assets/circle-eyes.svg";

interface BalanceHeaderProps {
  balances: Balance[];
  loading: boolean;
}

const BalanceHeader = ({ balances, loading }: BalanceHeaderProps) => {
  // each balance reports its own NGN equivalent, so the portfolio total is
  // just their sum - added as decimal strings, never as floats
  const total = sumAmounts(
    balances.map((b) => b.total.fiat?.amount ?? "0"),
  );
  const { whole, fraction } = amountParts(total);

  return (
    <div className="balance">
      <div className="balance-label">
        Total balance
        <img src={balanceInfoIcon} alt="" width="14" height="14" />
      </div>
      <div className="balance-amount">
        {loading ? (
          <span className="balance-loading">—</span>
        ) : (
          <>
            ₦{whole}
            <span className="balance-decimal">.{fraction}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default BalanceHeader;

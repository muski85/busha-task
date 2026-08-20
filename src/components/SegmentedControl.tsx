import { useState } from 'react';
import './SegmentedControl.css';

interface SegmentedControlProps {
  options: string[];
  defaultValue?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

export default function SegmentedControl({ options, defaultValue, fullWidth, onChange }: SegmentedControlProps) {
  const [active, setActive] = useState(defaultValue ?? options[0]);

  const select = (opt: string) => {
    setActive(opt);
    onChange?.(opt);
  };

  return (
    <div className={fullWidth ? 'segmented segmented--full' : 'segmented'}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={opt === active ? 'segment segment--active' : 'segment'}
          onClick={() => select(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { copyText, scheduleReset } from '../../lib/copyText';
import '../../styles/components/copy-field.css';

type Status = 'idle' | 'copied' | 'select';

interface CopyFieldProps {
  /** The text that is shown and copied. */
  value: string;
  /** What it is, for the button name and the announcement: "server address", "IP", "port". */
  what: string;
}

/** The value in the existing code style plus a real button that copies it. */
export function CopyField({ value, what }: CopyFieldProps) {
  const codeRef = useRef<HTMLElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => () => cancelRef.current?.(), []);

  const selectValue = () => {
    const el = codeRef.current;
    const sel = window.getSelection();
    if (!el || !sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const onClick = async () => {
    const outcome = await copyText(value, navigator.clipboard);
    if (outcome === 'select') selectValue();
    setStatus(outcome);
    cancelRef.current?.();
    cancelRef.current = scheduleReset(() => setStatus('idle'));
  };

  const label = status === 'copied' ? 'Copied' : status === 'select' ? 'Select and copy' : 'Copy';

  return (
    <span className="copy-field">
      <code className="home-address__value" ref={codeRef}>{value}</code>
      <button
        type="button"
        className={`copy-field__button copy-field__button--${status}`}
        aria-label={`Copy ${what} ${value}`}
        onClick={onClick}
      >
        {label}
      </button>
      <span className="copy-field__live" role="status" aria-live="polite">
        {status === 'copied' ? `Copied ${what}` : status === 'select' ? `Selected ${what}, press Ctrl+C to copy` : ''}
      </span>
    </span>
  );
}

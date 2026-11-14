import { buttonLabel } from './codeReferences';

interface CodeReferencesButtonProps {
  hidden: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * "Show code references" / "Hide code references". Text, not an icon. aria-pressed is true while
 * the references are shown; the label always names the action the next press does.
 */
export function CodeReferencesButton({ hidden, onToggle, className = '' }: CodeReferencesButtonProps) {
  return (
    <button
      type="button"
      className={`code-refs-button ${className}`.trim()}
      aria-pressed={!hidden}
      onClick={onToggle}
    >
      {buttonLabel(hidden)}
    </button>
  );
}

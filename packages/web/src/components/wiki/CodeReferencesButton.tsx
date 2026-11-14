import { ARTICLE_CONTENT_ID, buttonLabel } from './codeReferences';

interface CodeReferencesButtonProps {
  hidden: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * "Show code references" / "Hide code references". Text, not an icon. The label names the action
 * the next press does; there is no aria-pressed, which on a label that flips would read as a
 * double negative. aria-controls names the article body it changes.
 */
export function CodeReferencesButton({ hidden, onToggle, className = '' }: CodeReferencesButtonProps) {
  return (
    <button
      type="button"
      className={`code-refs-button ${className}`.trim()}
      aria-controls={ARTICLE_CONTENT_ID}
      onClick={onToggle}
    >
      {buttonLabel(hidden)}
    </button>
  );
}

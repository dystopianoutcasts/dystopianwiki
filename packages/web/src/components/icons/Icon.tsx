import { iconShape } from './iconShapes';

interface IconProps {
  /** An icon word from the navigation (`book`, `gear`, `map` ...) or a UI name (`home`, `path`). */
  name: string;
  className?: string;
}

/**
 * A drawn line icon (KB16), in place of the emoji the site used to show. Decorative: every
 * place that shows one also shows a text label, so it is hidden from assistive technology.
 * Stroked with currentColor and sized in em, so it follows the text colour and size in both
 * themes. No stylesheet import, so node:test can render it.
 */
export function Icon({ name, className }: IconProps) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {iconShape(name).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/** The icon for a navigation icon word, as an element (kept as the shared entry point). */
export function resolveIcon(name: string) {
  return <Icon name={name} />;
}

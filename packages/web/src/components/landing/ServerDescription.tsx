import { descriptionLines } from '../../lib/serverDescription';

// The server's own description in the hero, one block-level span per line: PZ writes
// a line break as the two characters backslash and n (lib/serverDescription.ts).
// Plain text only, never HTML. No hooks, so it renders in a test.

export function ServerDescription({ text }: { text: string }) {
  return (
    <>
      {descriptionLines(text).map((line, i) => (
        <span key={i} className="hero__subtitle-line">
          {line}
        </span>
      ))}
    </>
  );
}

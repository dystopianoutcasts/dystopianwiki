/**
 * The server's PublicDescription (server ini, via aurora.home_summary) as lines.
 *
 * Project Zomboid writes a line break in PublicDescription as the two characters
 * backslash and n, and the game's server browser shows them as new lines. Split on
 * that sequence, and on real line breaks (\n, \r\n) too, trim each line, and drop
 * empty lines at the start and end. The page renders each line as plain text.
 */
export function descriptionLines(text: string): string[] {
  const lines = text.split(/\\r\\n|\\n|\r\n|\n|\r/).map((line) => line.trim())
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  while (lines.length > 0 && lines[0] === '') lines.shift()
  return lines
}

/**
 * State of the Server (SOTS): the server's newsletter, read on the site at /sots.
 *
 * Each issue is a set of page images (public/sots/issue-NN/page-NN.webp, rendered from the
 * issue's PDF at 1400 px wide) and the text of each page, taken from the same PDF so the
 * issue can be read as text by screen readers and searched in the page. The PDF itself is
 * not published: the owner wants the issue read on the page, with nothing to download.
 */
import issue01 from './issue-01.json';

export interface SotsPage {
  n: number;
  title: string;
  src: string;
  width: number;
  height: number;
  lines: string[];
}

export interface SotsIssue {
  issue: string;
  title: string;
  short: string;
  season: string;
  covers: string;
  summary: string;
  cover: string;
  pages: SotsPage[];
}

/** The newest issue, shown at /sots and advertised on the home page. */
export const CURRENT_SOTS: SotsIssue = issue01;

/** One contents entry per section: a "(continued)" page belongs to the section before it. */
export function sotsContents(issue: SotsIssue): SotsPage[] {
  return issue.pages.filter((page) => !page.title.endsWith('(continued)'));
}

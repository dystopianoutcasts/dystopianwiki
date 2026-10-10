import type { Options } from 'react-markdown';
import { iconShape } from '../icons/iconShapes';

/** The footnote option of the markdown pipeline, typed from react-markdown (a declared dependency). */
type FootnoteBackOption = NonNullable<NonNullable<Options['remarkRehypeOptions']>['footnoteBackContent']>;
type FootnoteBackFunction = Exclude<FootnoteBackOption, string>;

/**
 * Content of a footnote's back link (KB16). The markdown pipeline's default is the character
 * U+21A9, which phones draw as an emoji; this draws the `return` icon instead. The link keeps
 * its own accessible name ("Back to reference 1"), so the icon is hidden from assistive
 * technology. A second reference to the same footnote keeps its superscript number.
 */
export const footnoteBackContent: FootnoteBackFunction = (_referenceIndex, rereferenceIndex) => {
  const icon = {
    type: 'element' as const,
    tagName: 'svg',
    properties: {
      className: ['icon', 'footnote-back-icon'],
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ariaHidden: 'true',
      focusable: 'false',
    },
    children: iconShape('return').map((d) => ({ type: 'element' as const, tagName: 'path', properties: { d }, children: [] })),
  };
  if (rereferenceIndex <= 1) return [icon];
  return [icon, { type: 'element' as const, tagName: 'sup', properties: {}, children: [{ type: 'text' as const, value: String(rereferenceIndex) }] }];
};

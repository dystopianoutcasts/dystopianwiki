/**
 * Field notes: the article style shared by the web renderer and the mobile app.
 *
 * Every article gets labelled callouts: a blockquote that opens with a bold label
 * (`> **Key Takeaway:** ...`) is drawn as a coloured callout. An article that also carries the
 * `::field-notes` marker gets the full look (cover header, numbered sections), and may use the
 * directives below. The web turns them into components (packages/web, remarkFieldNotes.ts);
 * the mobile app, which has no components for them, reads `fieldNotesToPlainMarkdown`.
 *
 *   ::field-notes                         turn the full look on (renders nothing)
 *   ::eyes-only[Members only]             hazard-stripe banner
 *   :::callout[Read this first]{kind=warn}  callout with a label (kinds below)
 *   ::::cards  /  :::card[How common?]{accent=orange}   card grid and its cards
 *                                         (accents, for cards and bars: orange, purple, blue, cream)
 *   :::facts                              a list of `**Key** text` items as a two-column list
 *   :::chips                              a list drawn as chips
 *   ::meter[Suppressed .22]{value=1 max=5 text="Quietest"}
 *   ::bar[1993]{value=10 max=100 text="Est. tens of thousands" accent=purple}
 *   :badge[Yes]{kind=yes}                 inline pill (kinds below)
 */
export declare const CALLOUT_KINDS: readonly ["key", "warn", "design", "proof"];
export type CalloutKind = (typeof CALLOUT_KINDS)[number];
export declare const DEFAULT_CALLOUT_LABEL: Record<CalloutKind, string>;
export declare const MAX_LABEL_LENGTH = 40;
export declare function calloutKindForLabel(label: string): CalloutKind;
export declare function isCalloutKind(value: unknown): value is CalloutKind;
export declare const BADGE_KINDS: readonly ["yes", "no", "maybe", "t1", "t2", "t3", "rare"];
export type BadgeKind = (typeof BADGE_KINDS)[number];
export declare function badgeKindFor(text: string, kind: string | null | undefined): BadgeKind;
export declare const CARD_ACCENTS: readonly ["orange", "purple", "blue", "cream"];
export type CardAccent = (typeof CARD_ACCENTS)[number];
export declare function cardAccentFor(accent: string | null | undefined): CardAccent;
export declare const METER_MAX_SEGMENTS = 10;
export interface Gauge {
    value: number;
    max: number;
}
export declare function readGauge(value: string | null | undefined, max: string | null | undefined, defaultMax: number): Gauge | null;
export declare function meterText(gauge: Gauge, text: string | null | undefined): string;
export declare function hasFieldNotesMarker(markdown: string): boolean;
export declare function parseAttributes(source: string | undefined): Record<string, string>;
/**
 * The same article with every field-notes directive turned into plain Markdown, for a renderer
 * that has no field-notes components (the mobile app). Callouts become blockquotes that open
 * with their bold label, card labels become bold lines, meters and bars become their words,
 * badges become bold words, and the markers themselves disappear. Code blocks are left alone,
 * and a line that only looks like a directive is kept as it is.
 */
export declare function fieldNotesToPlainMarkdown(markdown: string): string;
//# sourceMappingURL=index.d.ts.map
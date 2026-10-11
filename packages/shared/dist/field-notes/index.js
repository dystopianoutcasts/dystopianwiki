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
export const CALLOUT_KINDS = ['key', 'warn', 'design', 'proof'];
export const DEFAULT_CALLOUT_LABEL = {
    key: 'Key fact',
    warn: 'Warning',
    design: 'Design idea',
    proof: 'Proof',
};
// A bold label longer than this is a bold sentence, not a callout label.
export const MAX_LABEL_LENGTH = 40;
// Labels that pick a colour other than the default `key`. Matched lower-case, without the colon.
const LABEL_KIND = {
    warning: 'warn',
    caution: 'warn',
    danger: 'warn',
    important: 'warn',
    'read this first': 'warn',
    tip: 'design',
    idea: 'design',
    'design idea': 'design',
    'mod design idea': 'design',
    'next step': 'design',
    'next steps': 'design',
    proof: 'proof',
};
export function calloutKindForLabel(label) {
    return LABEL_KIND[label.trim().toLowerCase()] ?? 'key';
}
export function isCalloutKind(value) {
    return CALLOUT_KINDS.includes(value);
}
export const BADGE_KINDS = ['yes', 'no', 'maybe', 't1', 't2', 't3', 'rare'];
// `:badge[Yes]` and `:badge[No]` need no kind; anything else without one is `maybe`.
export function badgeKindFor(text, kind) {
    if (BADGE_KINDS.includes(kind))
        return kind;
    const word = text.trim().toLowerCase();
    if (word === 'yes')
        return 'yes';
    if (word === 'no')
        return 'no';
    return 'maybe';
}
export const CARD_ACCENTS = ['orange', 'purple', 'blue', 'cream'];
export function cardAccentFor(accent) {
    return CARD_ACCENTS.includes(accent) ? accent : 'orange';
}
export const METER_MAX_SEGMENTS = 10;
// A meter or bar reading, or null when the numbers are missing or make no sense.
export function readGauge(value, max, defaultMax) {
    const v = Number(value);
    const m = max === undefined || max === null || max === '' ? defaultMax : Number(max);
    if (!Number.isFinite(v) || !Number.isFinite(m) || m <= 0 || v < 0 || v > m)
        return null;
    return { value: v, max: m };
}
// The words a meter shows, and what a reader without the bar hears: "Quiet: 2 of 5".
export function meterText(gauge, text) {
    const reading = `${gauge.value} of ${gauge.max}`;
    return text ? `${text}: ${reading}` : reading;
}
const FENCE = /^\s*(`{3,}|~{3,})/;
const MARKER = /^::field-notes[ \t]*(?:\{[^}\n]*\})?[ \t]*$/;
// The lines of a Markdown document, each flagged when it sits inside a fenced code block.
function scanLines(markdown) {
    let fence = null;
    return markdown.split(/\r?\n/).map((line) => {
        const open = FENCE.exec(line);
        if (fence) {
            if (open && open[1][0] === fence[0] && open[1].length >= fence.length)
                fence = null;
            return { line, inCode: true };
        }
        if (open) {
            fence = open[1];
            return { line, inCode: true };
        }
        return { line, inCode: false };
    });
}
// True when the article opts into the full look. A marker shown inside a code block (a guide
// explaining the syntax) does not count.
export function hasFieldNotesMarker(markdown) {
    return scanLines(markdown).some(({ line, inCode }) => !inCode && MARKER.test(line));
}
// `{kind=warn label="Read this"}` as a map. Unquoted values end at whitespace.
export function parseAttributes(source) {
    const attrs = {};
    if (!source)
        return attrs;
    for (const m of source.matchAll(/([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s}]+)))?/g)) {
        attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
    }
    return attrs;
}
const CONTAINER = /^\s*(:{3,})([a-z][\w-]*)?(?:\[([^\]]*)\])?(?:\{([^}]*)\})?\s*$/;
const LEAF = /^\s*::([a-z][\w-]*)(?:\[([^\]]*)\])?(?:\{([^}]*)\})?\s*$/;
const BADGE = /:badge\[([^\]]*)\](?:\{[^}]*\})?/g;
function leafToPlain(name, label, attrs) {
    if (name === 'field-notes')
        return '';
    if (name === 'eyes-only')
        return `**EYES ONLY: ${label || 'Dystopian Outcasts members'}**`;
    if (name === 'meter' || name === 'bar') {
        const gauge = readGauge(attrs.value, attrs.max, name === 'meter' ? 5 : 100);
        if (!gauge)
            return null;
        const words = name === 'meter' ? meterText(gauge, attrs.text) : attrs.text || meterText(gauge, null);
        return label ? `**${label}:** ${words}` : words;
    }
    return null;
}
/**
 * The same article with every field-notes directive turned into plain Markdown, for a renderer
 * that has no field-notes components (the mobile app). Callouts become blockquotes that open
 * with their bold label, card labels become bold lines, meters and bars become their words,
 * badges become bold words, and the markers themselves disappear. Code blocks are left alone,
 * and a line that only looks like a directive is kept as it is.
 */
export function fieldNotesToPlainMarkdown(markdown) {
    const out = [];
    const stack = [];
    const quoteDepth = () => stack.filter((o) => o.quote).length;
    const emit = (line) => {
        const depth = quoteDepth();
        out.push(depth ? `${'> '.repeat(depth)}${line}`.trimEnd() : line);
    };
    for (const { line, inCode } of scanLines(markdown)) {
        if (inCode) {
            emit(line);
            continue;
        }
        const container = CONTAINER.exec(line);
        if (container) {
            const [, colons, name, label, attrSource] = container;
            if (!name) {
                // A closing fence closes the innermost container it can close.
                let at = stack.length - 1;
                while (at >= 0 && stack[at].colons > colons.length)
                    at--;
                if (at === -1) {
                    emit(line);
                    continue;
                }
                stack.splice(at);
                emit('');
                continue;
            }
            const attrs = parseAttributes(attrSource);
            if (name === 'callout') {
                const kind = isCalloutKind(attrs.kind) ? attrs.kind : 'key';
                emit('');
                stack.push({ colons: colons.length, quote: true });
                emit(`**${label || attrs.label || DEFAULT_CALLOUT_LABEL[kind]}:**`);
                emit('');
                continue;
            }
            stack.push({ colons: colons.length, quote: false });
            const heading = label || attrs.label;
            if (name === 'card' && heading) {
                emit('');
                emit(`**${heading}**`);
                emit('');
            }
            continue;
        }
        const leaf = LEAF.exec(line);
        if (leaf) {
            const plain = leafToPlain(leaf[1], leaf[2], parseAttributes(leaf[3]));
            if (plain !== null) {
                if (plain)
                    emit(plain);
                continue;
            }
        }
        emit(line.replace(BADGE, (_, text) => `**${text}**`));
    }
    return out.join('\n');
}

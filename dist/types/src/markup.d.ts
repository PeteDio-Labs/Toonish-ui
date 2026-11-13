export type Accent = 'blue' | 'red' | 'yellow' | 'violet';
export declare const esc: (s: string) => string;
export declare const HEX: Record<Accent, string>;
/** Shadow paired with each accent: never a complementary clash, never the fill's own colour. */
export declare const PAIR: Record<Accent, Accent>;
/** The badge class for an accent. Red is the base badge and has no modifier. */
export declare const BADGE: Record<Accent, string>;
/** A comic starburst, drawn once per accent: the shape behind a hero word or a figure. */
export declare const burst: (accent: Accent, cls?: string) => string;
/** Speed lines: a fan of yellow strokes behind a panel. Ink would vanish on the navy ground. */
export declare const speedLines: (cls?: string) => string;
export interface LettersOptions {
    live?: boolean;
    flat?: boolean;
    cls?: string;
    size?: number;
}
/**
 * Display type: a heavy sans in the accent colour. With `live`, the comic face with an ink outline and a short shadow in
 * the paired colour, for the logo and the hero. Each letter is its own span, so the kit's CSS can tilt them in turn.
 * The text stays real text, so readers and search see it as written.
 */
export declare const letters: (text: string, accent?: Accent, opts?: LettersOptions) => string;
/**
 * The largest font size, in px and at most `max`, at which the longest word of `value` fits in `avail` px.
 * Words wrap between spaces, so the longest word sets the width. The display face runs about 0.6em per character.
 */
export declare const fitSize: (value: string, max: number, avail: number) => number;
/** A figure on a paper card: the display type, flat and heavy. It shrinks as the value gets longer, so it stays inside the card. */
export declare const figure: (value: string, accent: Accent, max: number, avail: number) => string;
export interface ShotOptions {
    src: string;
    /** What the image shows, for people who cannot see it. Required: an empty alt would hide the picture. */
    alt: string;
    width: number;
    height: number;
    caption?: string;
    badge?: string;
    accent?: Accent;
    /** The text of the image, one line per message. Rendered below the image in a disclosure. */
    transcript?: string;
    /** Show the transcript expanded. */
    open?: boolean;
    /** Makes the whole picture a link to this URL (the full-size file), opened in a new tab. Needs `hrefLabel`. */
    href?: string;
    /** The link's accessible name, such as "Open the full-size picture". Required with `href`. */
    hrefLabel?: string;
    /** A short second badge on the top right corner, such as "1 / 4" for a picture in a sequence. */
    corner?: string;
    /** A "Tap to enlarge" style hint on the bottom right corner. It hides from `lg`. Use it with `href`. */
    hint?: string;
    /** Load the image at once. Use it for a shot above the fold; the default is lazy. */
    eager?: boolean;
    cls?: string;
}
/** A screenshot in a comic panel: `<figure>` with the image, optional corner badges, a caption and a transcript. With `href`, the image is a link. */
export declare const shot: (o: ShotOptions) => string;
/** A badge colour: an accent, or `paper` or `mist` for a neutral. */
export type Tone = Accent | 'paper' | 'mist';
/** A badge with an optional count, such as a status and how many items have it. */
export declare const badge: (text: string, tone?: Tone, count?: number) => string;
/** A small tag. */
export declare const chip: (text: string) => string;
/** A figure tile: label, value and an optional line of detail. Put tiles inside `<div class="toon-stats">`. */
export declare const stat: (label: string, value: string, detail?: string) => string;
export interface RowOptions {
    /** The lead: a date or a tag. */
    lead?: string;
    title: string;
    /** Quieter text after the title. */
    sub?: string;
    /** Text at the end of the row. */
    aside?: string;
    /** A colour dot before the aside. */
    dot?: Tone;
}
/** A row for `<div class="toon-list">`. */
export declare const row: (o: RowOptions) => string;
export interface BarSegment {
    value: number;
    tone: Tone | 'hatch';
    /** Names the segment for a screen reader. */
    label: string;
}
export interface BarColumn {
    label: string;
    /** A second line under the label, such as a date. */
    sub?: string;
    segments: BarSegment[];
    /** Marks the column that stands for now. */
    current?: boolean;
}
export interface BarsOptions {
    columns: BarColumn[];
    /** The value that fills the plot. Defaults to the largest stack, and never less than `target`. */
    max?: number;
    /** Draws a dashed reference line at this value. */
    target?: number;
    /** Names the chart for a screen reader. */
    label: string;
}
/**
 * Stacked columns on one scale. Heights are percentages of `max`, so the CSS needs no script. Each column carries
 * an `aria-label` with its numbers, because the shapes alone do not say them.
 */
export declare const bars: (o: BarsOptions) => string;
export interface KickerOptions {
    /** A short link at the end of the row, such as "All case studies". */
    link?: {
        href: string;
        text: string;
        cls?: string;
    };
    cls?: string;
}
/** A section lead-in: a number chip, a short label, a rule to the right edge and an optional link. */
export declare const kicker: (num: string, label: string, o?: KickerOptions) => string;
export interface StripCell {
    value: string;
    label: string;
    /** Makes the whole cell a link. */
    href?: string;
    /** The figure's colour. Without it the colour cycles by cell. */
    accent?: Accent;
}
export interface StripOptions {
    /** Names the strip for a screen reader. */
    label?: string;
    cls?: string;
}
/** A row of figure cells in one bordered panel: four across, two by two on a phone. */
export declare const strip: (cells: StripCell[], o?: StripOptions) => string;
export interface Step {
    title: string;
    body: string;
}
export interface StepsOptions {
    /** Names the list for a screen reader. */
    label?: string;
    cls?: string;
}
/** Numbered panels read in order, with a decorative arrow between them: right in a row, down when stacked. */
export declare const steps: (items: Step[], o?: StepsOptions) => string;
export interface SfxOptions {
    size?: 'sm' | 'lg';
    /** An outline only, low in contrast, for sitting behind content. */
    ghost?: boolean;
    cls?: string;
}
/**
 * A sound-effect word in the comic face, each letter turned, raised and sized by its index so it looks hand-lettered.
 * Decoration only: it is `aria-hidden`, so put real meaning in text elsewhere. Place it with `absolute` inside a `relative` parent.
 */
export declare const sfx: (text: string, accent?: Accent, opts?: SfxOptions) => string;
export interface DeckOptions {
    /** Names the pile for a screen reader, such as "More recent case studies". Required. */
    label: string;
    /** Keep the pile at every width. By default it turns off from `md`, and the cards lay out as a grid. */
    always?: boolean;
    /** Columns of the grid from `md` up. Defaults to 3. */
    cols?: number;
    /** Text of the previous and next buttons. Default "Previous" and "Next". */
    prevLabel?: string;
    nextLabel?: string;
    cls?: string;
}
/**
 * A pile of cards you flip through on a phone, and a grid from `md` up. Pass each card as HTML: the helper wraps it and
 * does NOT escape it, because a card is markup you wrote, so escape any text you put in a card yourself. It does escape
 * `label` and every other string option. `initToonish` (dist/toonish.js) builds the pile; without script the cards
 * are a plain list and the controls stay hidden. Each card is a group labelled "1 of 3" and every card but the top one
 * is `inert` while the pile is on.
 */
export declare const deck: (cards: string[], o: DeckOptions) => string;

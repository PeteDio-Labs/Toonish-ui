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
    /** Load the image at once. Use it for a shot above the fold; the default is lazy. */
    eager?: boolean;
    cls?: string;
}
/** A screenshot in a comic panel: `<figure>` with the image, an optional corner badge, a caption and a transcript. */
export declare const shot: (o: ShotOptions) => string;

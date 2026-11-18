export type Accent = 'blue' | 'red' | 'yellow' | 'violet';
export declare const esc: (s: string) => string;
export declare const HEX: Record<Accent, string>;
/** The accent at a depth that reads on paper: 3:1 or better for large text. The fills in HEX are 1.4 to 2.7:1 on paper. */
export declare const HEX_TEXT: Record<Accent, string>;
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
    flat?: boolean; /** Use the deeper accent, which reads on paper. Default is the fill for the navy ground. */
    onPaper?: boolean;
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
    /** The colour of the small dot before the lead. Default ink. Needs `lead`. */
    leadTone?: Tone;
    /** An inline `<svg>` drawn for the row, about 48 px square. It is decoration: the row's text says everything the icon does, so the helper hides it from a screen reader. */
    icon?: string;
}
/** A row for `list()`. It is a `listitem`, so the container must be `role="list"`. */
export declare const row: (o: RowOptions) => string;
export interface ListOptions {
    /** Names the list for a screen reader. Required. */
    label: string;
    cls?: string;
}
/** A panel of rows. A `div` with grid layout loses its list semantics in some readers, so the helper sets `role="list"`. Pass rows from `row()`. */
export declare const list: (rows: string[], o: ListOptions) => string;
export type ButtonKind = 'primary' | 'secondary' | 'accent' | 'danger';
declare const BUTTON_ICON: Record<string, string>;
export type ButtonIcon = keyof typeof BUTTON_ICON;
export interface ButtonOptions {
    /** The words on the button. Required, because the icon is decoration. */
    label: string;
    /** Makes the button a link (`<a>`). Without it the helper writes `<button>`. */
    href?: string;
    /** The look: `primary` blue, `secondary` paper, `accent` yellow, `danger` red. Default `primary`. */
    kind?: ButtonKind;
    /** A built-in icon name, or your own inline `<svg>` (the same rules as `row({ icon })`). */
    icon?: ButtonIcon | (string & {});
    /** Which side of the label the icon sits on. `back` and `next` choose the arrow and the side for you. */
    iconPosition?: 'start' | 'end';
    /** `back` puts a left arrow before the label and `next` puts a right arrow after it. The arrow nudges to say which way the button goes. */
    direction?: 'back' | 'next';
    /** `type` of a `<button>`. Default `button`. */
    type?: 'button' | 'submit' | 'reset';
    /** The button fills its row. */
    full?: boolean;
    cls?: string;
    /** Extra attributes, such as `data-*` or `aria-*`. Keys are lower case names. `class`, `href`, `type` and event handlers are refused. */
    attrs?: Record<string, string>;
}
/**
 * A button or a link styled as one. The icon is decoration and the label says what it does, so the icon is `aria-hidden`.
 * Use `direction: 'back'` for a way out of a page and `direction: 'next'` for a way on: the arrow nudges, so the button reads as something you press.
 */
export declare const button: (o: ButtonOptions) => string;
/** A skip link: the first focusable element on the page, hidden until it takes focus. Point it at the id of `<main>`. */
export declare const skipLink: (target?: string, text?: string) => string;
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
    /** Makes the label a heading of this level, so the section shows in the page outline. The number chip is then `aria-hidden`. */
    heading?: 2 | 3 | 4 | 5 | 6;
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
/** A row of figure cells in one bordered panel: four across, two by two on a phone. A space sits between the figure and its label, so a linked cell is named "22 case studies", not "22case studies". */
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
    /** A sticker on the top right corner of a `relative` parent, at every width. */
    corner?: boolean;
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
export interface PortraitOptions {
    /** A cut-out portrait with a transparent background (PNG or WebP). The kit draws the backdrop behind it. */
    src: string;
    /** Who is shown and how, for people who cannot see it. Required: an empty alt would hide the picture. */
    alt: string;
    width: number;
    height: number;
    /** `slate` is a dark studio grey. `paper` is the kit's cool grey. */
    backdrop?: 'slate' | 'paper';
    /** The colour of the halftone dots and ring in the corner. */
    accent?: Accent;
    eager?: boolean;
    cls?: string;
}
/**
 * A portrait on a themed vector backdrop. Pass any cut-out of a person (transparent PNG or WebP) and the kit draws a soft
 * radial gradient, a halftone corner and a ring behind it, so every portrait on a site shares one studio look.
 * The backdrop is SVG, so it stays sharp at any size and costs no image bytes. Size the figure with `cls` or its parent.
 */
export declare const portrait: (o: PortraitOptions) => string;
export interface PagerLink {
    href: string;
    /** The title of the page the link opens. Shown as plain text under the direction. */
    title: string;
    /** The direction word. "Previous" or "Next" unless you set it. */
    dir?: string;
}
export interface PagerOptions {
    prev?: PagerLink;
    next?: PagerLink;
    /** Names the nav for a screen reader. */
    label: string;
    cls?: string;
}
/**
 * Previous and next links in the shape of the deck's switcher: an arrow in a disc, the direction in bold and the
 * destination's title under it. Pass either link or both. Every string is escaped.
 */
export declare const pager: (o: PagerOptions) => string;
/** Who owns an item. `a` is ink with a solid dot; `b` is violet with a ringed dot, so the shape changes as well as the colour. */
export type Owner = 'a' | 'b';
export interface DeltaOptions {
    /** Text after the number, such as "%". The spoken form says "points" when you give none. */
    unit?: string;
    /** Swap the colours for a measure where down is good. The glyph still says which way it moved. */
    invert?: boolean;
    /** Use the colours that read on the navy ground. The default reads on paper. */
    ground?: boolean;
}
/** A signed change such as "▲ 4", "▼ 32" or "· 0". The glyph is visible text, and `aria-label` says it aloud. Direction is never colour alone. */
export declare const delta: (n: number, o?: DeltaOptions) => string;
export interface ScaleOptions {
    /** The current value from 0 to 100, or `null` for an item with no score. */
    value: number | null;
    /** Past values, oldest first. The last one is the previous value, and the move segment runs from it to `value`. */
    history?: number[];
    owner?: Owner;
    /** Draw ticks at 25, 50 and 75. Default true. */
    ticks?: boolean;
    /** Says the score and the move for a screen reader, such as "P-01 scores 82, up 4 from 78". Required. */
    label: string;
    /** Clamp a value outside 0 to 100 instead of throwing. */
    clamp?: boolean;
}
/** A 0 to 100 track with one current marker, faint dots for past values and a segment for the latest move. Every part is a span, so it can sit inside a button. */
export declare const scale: (o: ScaleOptions) => string;
/** The axis row for a column of scales: 0, 25, 50, 75 and 100. It repeats what the page says, so it is hidden from a screen reader. */
export declare const scaleAxis: () => string;
export type MeterTone = 'blue' | 'red' | 'yellow' | 'violet' | 'mist' | 'green';
export interface MeterOptions {
    /** Names the bar for a screen reader, and shows above it. Required. */
    label: string;
    value: number;
    /** The value that fills the bar. Default 100. */
    max?: number;
    tone?: MeterTone;
    /** `lg` makes the bar 16 px tall and the number larger. Default `md`. */
    size?: 'md' | 'lg';
    /** A second line under the label, such as "vs US, was 42". */
    sub?: string;
    /** Labels under a large meter, left to right, such as "0 · coincidence". */
    scaleLabels?: string[];
    /** Replaces the printed number and the spoken value, such as "~7%". */
    valueText?: string;
    /** Clamp a value outside 0 to `max` instead of throwing. */
    clamp?: boolean;
    /** The id prefix for the label. Default is generated, so pass one for stable output. */
    id?: string;
}
/** One value out of a maximum. The bar is `role="meter"`, named by the visible label. */
export declare const meter: (o: MeterOptions) => string;
export interface MetersOptions {
    /** Names the list for a screen reader. Required. */
    label: string;
    cls?: string;
}
/** A list of meters with ink dividers, for use inside a card. Pass options, or markup from `meter()`. */
export declare const meters: (items: (MeterOptions | string)[], o: MetersOptions) => string;
export interface TabSpec {
    /** The id of the panel this tab opens. The hash holds it, so `#board` opens the tab for `board`. */
    id: string;
    label: string;
    /** An SVG you trust. The helper hides it from a screen reader. */
    icon?: string;
}
export interface TabbarOptions {
    /** Names the nav for a screen reader. Required. */
    label: string;
    /** The id of the selected tab. Default is the first. */
    selected?: string;
    /** From md, show the bar as a row of pills at the top of the page. */
    top?: boolean;
    cls?: string;
}
/**
 * A tab bar for a single-page app with up to five sections. `initToonish` wires it: a click switches panels, the arrow keys,
 * Home and End move between tabs, and the hash keeps the selected tab. Without script every panel shows and each tab is an in-page link.
 * Pair each tab with `tabpanel(id, html)`.
 */
export declare const tabbar: (tabs: TabSpec[], o: TabbarOptions) => string;
/** The panel for a tab made by `tabbar()`. It is labelled by that tab. `html` is markup you wrote and is not escaped. */
export declare const tabpanel: (id: string, html: string, cls?: string) => string;
export interface DisclosureOptions {
    /** Prefix for the ids. The panel takes it, and the button takes `<id>-btn`. Required. */
    id: string;
    /** A mono id for the row, such as "P-01". Required. */
    lead: string;
    title: string;
    /** A line of plain words under the title: what the row means, in muted type. It wraps, and a screen reader reads it with the row. */
    sub?: string;
    /** A badge after the title. Text, or text with a tone (default yellow). */
    badge?: string | {
        text: string;
        tone?: Tone;
    };
    /** A large figure at the end of the line. */
    value?: string | number;
    /** A short text at the end of the line, such as an age or a host. It is quieter than `value`, which is sized for a figure. Not with `value`. */
    note?: string;
    /** The signed change after the value. */
    delta?: number | (DeltaOptions & {
        value: number;
    });
    /** A full-width slot under the line, such as a `scale()`. Markup you trust, not escaped. */
    below?: string;
    /** The detail. Markup you trust, not escaped. */
    panel: string;
    open?: boolean;
    owner?: Owner;
    /** The colour of the lead's dot. Default ink, or violet for owner `b`. */
    tone?: Tone;
    /** Says the owner aloud, such as "Pedro". The dot and colour show it to the eye. */
    ownerLabel?: string;
    /** Use `<details>` and `<summary>`, which work without script. */
    native?: boolean;
    /** Wrap the button in a heading of this level. Not for `native`. */
    heading?: 2 | 3 | 4 | 5 | 6;
}
/**
 * A list row that opens to show detail. It is a `listitem`, so put it in `list()`. By default the row is a `<button>` with
 * `aria-expanded` and `aria-controls` that `initToonish` toggles. With `native`, it is `<details>` and needs no script.
 */
export declare const disclosure: (o: DisclosureOptions) => string;
export interface SparkOptions {
    min?: number;
    max?: number;
    accent?: Accent;
    /** Draws a dashed baseline at this value. */
    target?: number;
    /** Names what the trend measures. The helper adds "Trend from 73 to 82 over 8 readings". Required. */
    label: string;
    /** `sm` is 64 by 20. `lg` is 120 by 32. Default `sm`. */
    size?: 'sm' | 'lg';
    /** Clamp a value outside `min` to `max` instead of throwing. */
    clamp?: boolean;
}
/** A small inline trend: an ink line, a dot per reading and a ringed last dot in the accent. Drawn for paper. */
export declare const spark: (values: number[], o: SparkOptions) => string;
export type UptimeState = 'ok' | 'down' | 'unknown';
export interface UptimeCell {
    /** When the interval was read, as an ISO time. */
    at: string;
    state: UptimeState;
    /** Spoken after the state, such as "timeout after 5 s". */
    detail?: string;
}
export interface UptimeOptions {
    /** Names the strip for a screen reader and heads it. Required. */
    label: string;
    /** The span the strip covers, such as "last 24 hours". Shown after the label. */
    windowLabel?: string;
    cells: UptimeCell[];
}
/**
 * One cell per interval, oldest first. State shows three ways: colour, height (an unknown cell is short and outlined) and a hatch
 * on a down cell. The summary line counts all three states, so an unknown interval never reads as ok.
 */
export declare const uptime: (o: UptimeOptions) => string;
export interface LinePoint {
    /** An ISO time, or any label. Points with the same `x` line up across series. */
    x: string;
    y: number;
}
export interface LineSeries {
    name: string;
    points: LinePoint[];
}
export interface LineOptions {
    /** Names the chart. Required. */
    label: string;
    /** Up to four series. Each gets its own colour, dash pattern and marker shape. */
    series: LineSeries[];
    /** Printed after the label and after each end value, such as "ms". */
    yUnit?: string;
    /** Draws a dashed reference line and names it in the table. */
    target?: number;
    /** The bottom of the scale. Default 0. A value below it throws. */
    min?: number;
    /** The top of the scale. Default: the largest value or target, rounded up. */
    max?: number;
    /** The summary on the table's toggle. Default "Show as table". */
    tableLabel?: string;
}
/**
 * A line chart for values over time, with a table of the same numbers. The key under the chart prints each series' latest
 * value, so the chart needs no hover. Points sit on an even category axis, one slot per distinct `x`, oldest first.
 */
export declare const line: (o: LineOptions) => string;
export type TileState = 'ok' | 'warn' | 'down' | 'unknown';
export interface StatusTileOptions {
    label: string;
    /** The reading. Leave it out, or pass `null`, when the state is `unknown`: the tile prints "no reading". */
    value?: string | null;
    /** The state: a glyph and a word as well as a colour. `unknown` is a state of its own and never reads as ok. */
    state: TileState;
    /** A change since the last reading. A number, or the options of `delta()`. */
    delta?: number | {
        value: number;
        unit?: string;
        invert?: boolean;
    };
    /** When the value was read, as an ISO time. Printed on the tile. */
    readAt?: string;
    /** Text to print in place of the formatted `readAt`, such as "4 min ago". */
    readAtText?: string;
    /** A line under the value. */
    detail?: string;
    /** Markup you trust, such as a `spark()`. It is not escaped. */
    extra?: string;
}
/** A figure with a state. The state is a glyph and a word, so colour is a second cue. Put tiles in `<div class="toon-tiles">`. */
export declare const statusTile: (o: StatusTileOptions) => string;
export type Place = 'lab' | 'cloud';
export interface SwitchRowOptions {
    /** The service name. Required. */
    name: string;
    hostname?: string;
    /** Which side serves traffic now. */
    active: Place;
    labState: UptimeState;
    cloudState: UptimeState;
    /** How old each reading is, as text such as "4 min ago". */
    labAge?: string;
    cloudAge?: string;
    /** What the service holds, such as "stateless" or "database". */
    dataClass?: string;
    /** The service is pinned to its side and the switch is off the table. */
    pinned?: boolean;
    /** Whether a switch is allowed now. When it is not, `reason` is required. */
    canSwitch: boolean;
    /** Why a switch is not allowed, or what a switch waits for. Shown under the row, and the control points to it. */
    reason?: string;
    /** The button's text. Default "Switch to cloud" or "Switch to lab". */
    buttonLabel?: string;
    /** Markup you trust, in place of the default button. You attach its handler. */
    action?: string;
    /** `button` (the default) or `toggle`: a `role="switch"` control between the two side names, checked when the cloud serves. */
    control?: 'button' | 'toggle';
    /** The words for each side. Default "Lab" and "Cloud". */
    labels?: {
        lab?: string;
        cloud?: string;
    };
    /** The id prefix. Default is generated. */
    id?: string;
}
/**
 * A service that runs in the lab or in the cloud: both sides next to each other, each with a state glyph and word and the age
 * of its reading, and a button to switch. The kit attaches no handler. The button carries `data-toon-switch` (the name) and
 * `data-toon-switch-to` (the side), and `aria-disabled` while `canSwitch` is false: the kit script drops a click on it.
 */
export declare const switchRow: (o: SwitchRowOptions) => string;
export interface ToggleOptions {
    /** The accessible name, which says what "on" means, such as "Authentik: run on cloud". Required. */
    label: string;
    checked: boolean;
    /** The visible word on the unchecked side. Required. */
    off: string;
    /** The visible word on the checked side. Required. */
    on: string;
    /** Sets `aria-disabled`. The control keeps focus, and the kit script drops its click. Point `describedBy` at the visible reason. */
    disabled?: boolean;
    /** The id of the text that explains the state. */
    describedBy?: string;
    id?: string;
    /** `data-*` attributes for your handler. */
    attrs?: Record<string, string>;
}
/**
 * A two-state switch: a `role="switch"` button between two visible words. The side that is on is bold and underlined, and
 * the thumb sits next to it, so the state is never colour alone. The kit attaches no handler and does not flip the state:
 * you set `checked` when the change has happened.
 */
export declare const toggle: (o: ToggleOptions) => string;
export interface VerdictOptions {
    /** `ok`, `warn`, `down` or `unknown`. A glyph and a word say it, and the fill backs them up. */
    state: TileState;
    /** The answer, in one short sentence. Required. */
    title: string;
    /** One or two sentences under the answer: why, or what to do next. */
    body?: string;
    /** Words for the state line in place of "Ok", "Warning", "Down" or "Unknown", such as "Needs you". */
    stateText?: string;
    /** Makes the title a heading of this level. */
    heading?: 2 | 3 | 4 | 5 | 6;
    id?: string;
    cls?: string;
}
/**
 * The answer a view leads with: a state line (a glyph and a word), the answer in one sentence, and an optional line under it.
 * Put it first, the evidence after it and a `readout()` last. `unknown` is dashed and never reads as ok.
 */
export declare const verdict: (o: VerdictOptions) => string;
export interface ReadoutOptions {
    /** The small label above the text. Default "What was read". */
    label?: string;
    /** Set it inside a paper surface: the label and rule turn ink. The default is for the navy ground. */
    onPaper?: boolean;
    cls?: string;
}
/**
 * Says what a view read: counts, the age of the read and the source. It is the quiet last line of a section, and it stays
 * readable: full-strength text at 15 px under a mono label, never a dimmed or shrunken line.
 */
export declare const readout: (text: string, o?: ReadoutOptions) => string;
/** The key for `bars()`: one entry per tone, in words. A `hatch` entry draws the same hatch as its segment. */
export declare const barsKey: (items: {
    label: string;
    tone: Tone | 'hatch';
}[], o?: {
    label?: string;
}) => string;
export interface ChartTableOptions {
    /** Names the table. It is the caption, and the toggle reads "Show <caption> as a table". Required. */
    caption: string;
    /** The column headings. The first one heads the row labels. */
    head: string[];
    /** One array per row. The first cell is the row's heading. */
    rows: string[][];
    /** The toggle's text, in place of "Show <caption> as a table". */
    summary?: string;
}
/**
 * The numbers behind a chart, in a `<details>` the reader opens: the text equivalent `bars()` needs. The table sits in a
 * `toon-table-wrap` a keyboard can scroll, and the toggle is 44 px tall.
 */
export declare const chartTable: (o: ChartTableOptions) => string;
export interface MastheadOptions {
    /** The page title. It is the `h1`: the lettering is decoration and an `sr-only` span carries the text. Required. */
    title: string;
    accent?: Accent;
    /** A caption box above the title, such as the owner's name. */
    eyebrow?: string;
    /** One line under the title that says what the page is for. */
    lede?: string;
    cls?: string;
}
/** The header of an app page: a caption box, the title in comic lettering and one line that says what the page is for. */
export declare const masthead: (o: MastheadOptions) => string;
export interface SwitchCardOptions {
    /** The service name. Required. */
    name: string;
    /** Which side serves traffic now. */
    active: Place;
    labState: UptimeState;
    cloudState: UptimeState;
    /** Whether a switch to the other side is allowed now. When it is not, `reason` is required. */
    canSwitch: boolean;
    /** One short sentence: why a switch is refused, or what it waits for. The idle side's button points to it. */
    reason?: string;
    /** A chip beside the name, such as "replicated". */
    dataClass?: string;
    /** Adds a "Pinned" badge. */
    pinned?: boolean;
    /** The words for each side. Default "Lab" and "Cloud". */
    labels?: {
        lab?: string;
        cloud?: string;
    };
    /** The id prefix. Default is generated. */
    id?: string;
}
/**
 * A service that runs on one of two sides, as two buttons. The side that serves is pressed and filled: green when it is up,
 * red when it is down. The other side is a raised button that asks for the switch, or a dashed flat one with a reason when
 * a switch is refused. Each button says its side and its state with a glyph and a word. The kit attaches no handler: listen
 * for a click on `[data-toon-switch-to]`, and ignore the pressed one.
 */
export declare const switchCard: (o: SwitchCardOptions) => string;
export interface GearsOptions {
    /** `active` (the default) turns the gears while an ancestor `.toon-settings` is hovered, focused or open. `always` turns them all the time. */
    spin?: 'active' | 'always';
    cls?: string;
}
/**
 * A double-layered settings icon: a large gear and a small one that meshes with it, drawn in ink with a hard shadow. The
 * gears turn in opposite directions. It is `aria-hidden`, so name the control that holds it. The system's reduced-motion
 * preference stops the turning, as it stops every kit animation.
 */
export declare const gears: (o?: GearsOptions) => string;
export interface SettingsItem {
    label: string;
    /** A link target. Use a `#hash` to stay on the page. */
    href: string;
    /** Marks the item for the current page. */
    current?: boolean;
}
export interface SettingsMenuOptions {
    /** The control's accessible name. Default "Settings". */
    label?: string;
    /** One link per setting area. At least one. */
    items: SettingsItem[];
    id: string;
    /** Passed to `gears()`. */
    spin?: 'active' | 'always';
    cls?: string;
}
/**
 * The settings control: a button of two gears that opens a short list of links. It is a `<details>`, so it opens and closes
 * without script. The script adds closing on `Escape`, on a tap outside and on choosing an item. Put it in a header.
 */
export declare const settingsMenu: (o: SettingsMenuOptions) => string;
export {};

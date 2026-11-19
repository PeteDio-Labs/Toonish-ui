// tokens/toonish.tokens.json
var toonish_tokens_default = {
  $description: "Toonish design tokens in the W3C Design Tokens format (2025.10). Structure comes from the PeteDio house tokens; colour is the deliberate break from that set. Every fill carries ink text, which keeps contrast at 5.1:1 or better.",
  color: {
    $type: "color",
    ground: { $value: "#0c1240", $description: "Page background, deep navy." },
    ink: { $value: "#0a0a1f", $description: "Outlines, and text on every fill." },
    paper: { $value: "#eceff3", $description: "Panels and bubbles; text on the ground." },
    blue: { $value: "#5f8dff" },
    red: { $value: "#f2706a" },
    yellow: { $value: "#ff94c8" },
    violet: { $value: "#a995f0" },
    "blue-text": { $value: "#2a57d6", $description: "Blue for large figures on paper. The fill blue is 2.7:1 on paper; this is 5.3:1." },
    "red-text": { $value: "#c8322b", $description: "Red for large figures on paper (4.6:1)." },
    "violet-text": { $value: "#6b4fd6", $description: "Violet for large figures on paper (4.9:1)." },
    "yellow-text": { $value: "#b3236f", $description: "The accent for large figures on paper (5.4:1). The fill is 1.8:1 on paper." },
    green: { $value: "#4ccf8f", $description: "The ok state: a fill and a shadow. Not a fifth accent. Green says healthy, clear or serving, and nothing else." },
    "green-text": { $value: "#0f6e42", $description: "Green for an ok state's text on paper (5.5:1). The fill green is 1.7:1 on paper." },
    muted: { $value: "#4a4d78", $description: "Secondary text on paper." },
    mist: { $value: "#b9bde0", $description: "Secondary text on the ground, and the quiet fill for a closed or inactive state." },
    rule: { $value: "#d3d8e0", $description: "Grid lines and the current-row fill on paper." }
  },
  palette: {
    $type: "color",
    $description: "Four ways to dress one strip of the page, such as a verdict banner. Each has six roles: fill, text on the fill, the state word, the edge, the hard shadow and the lettering accent. Every text pair meets WCAG 2.2 AA, and test/tokens.test.ts asserts it. The names are roles, so a page asks for palette.ink-fill and never for a hex.",
    "ink-fill": { $value: "{color.ink}", $description: "Ink palette: a dark strip. Its edge is mist, because ink on the navy ground is 1.09:1." },
    "ink-text": { $value: "{color.paper}", $description: "16.9:1 on the ink fill." },
    "ink-state": { $value: "{color.red}", $description: "The state word on ink: 6.8:1." },
    "ink-edge": { $value: "{color.mist}", $description: "9.7:1 against the ground." },
    "ink-shadow": { $value: "{color.blue}" },
    "ink-accent": { $value: "{color.red}", $description: "Lettering fill, with a paper outline. Decoration." },
    "paper-fill": { $value: "{color.paper}", $description: "Paper palette: a light strip." },
    "paper-text": { $value: "{color.ink}", $description: "16.9:1 on the paper fill." },
    "paper-state": { $value: "{color.red-text}", $description: "The state word on paper: 4.6:1." },
    "paper-edge": { $value: "{color.ink}" },
    "paper-shadow": { $value: "{color.blue}" },
    "paper-accent": { $value: "{color.red}", $description: "Lettering fill, with an ink outline. Decoration." },
    "violet-fill": { $value: "{color.violet}", $description: "Violet palette. 7.0:1 against the ground." },
    "violet-text": { $value: "{color.ink}", $description: "7.7:1 on the violet fill." },
    "violet-state": { $value: "{color.ink}", $description: "The state word is ink, because red on violet fails." },
    "violet-edge": { $value: "{color.ink}" },
    "violet-shadow": { $value: "{color.blue}" },
    "violet-accent": { $value: "{color.paper}", $description: "Lettering fill, with an ink outline. Decoration." },
    "blue-fill": { $value: "{color.blue}", $description: "Blue palette. 5.7:1 against the ground." },
    "blue-text": { $value: "{color.ink}", $description: "6.3:1 on the blue fill." },
    "blue-state": { $value: "{color.ink}", $description: "The state word is ink, because red on blue fails." },
    "blue-edge": { $value: "{color.ink}" },
    "blue-shadow": { $value: "{color.violet}" },
    "blue-accent": { $value: "{color.paper}", $description: "Lettering fill, with an ink outline. Decoration." }
  },
  font: {
    family: {
      $type: "fontFamily",
      display: { $value: ["IBM Plex Sans", "system-ui", "sans-serif"] },
      comic: { $value: ["Bangers", "Arial Black", "Impact", "sans-serif"] },
      body: { $value: ["IBM Plex Sans", "system-ui", "sans-serif"] },
      mono: { $value: ["IBM Plex Mono", "ui-monospace", "monospace"], $description: "Labels: badges, chips, stat labels and captions." }
    },
    size: {
      $type: "dimension",
      caption2: { $value: { value: 11, unit: "px" } },
      caption1: { $value: { value: 12, unit: "px" } },
      footnote: { $value: { value: 13, unit: "px" } },
      subhead: { $value: { value: 15, unit: "px" } },
      body: { $value: { value: 17, unit: "px" } },
      title3: { $value: { value: 20, unit: "px" } },
      title2: { $value: { value: 22, unit: "px" } },
      title1: { $value: { value: 28, unit: "px" } }
    },
    fluid: {
      $description: "Fluid display sizes. CSS clamp() has no DTCG type, so these are plain strings.",
      display2: { $value: "clamp(32px,5.5vw,52px)" },
      display1: { $value: "clamp(44px,10vw,104px)" },
      hero: { $value: "clamp(52px,10vw,144px)" }
    }
  },
  space: {
    $type: "dimension",
    s1: { $value: { value: 4, unit: "px" } },
    s2: { $value: { value: 8, unit: "px" } },
    s3: { $value: { value: 12, unit: "px" } },
    s4: { $value: { value: 16, unit: "px" } },
    s5: { $value: { value: 20, unit: "px" } },
    s6: { $value: { value: 24, unit: "px" } },
    s8: { $value: { value: 32, unit: "px" } }
  },
  radius: {
    $type: "dimension",
    group: { $value: { value: 12, unit: "px" } },
    card: { $value: { value: 16, unit: "px" } },
    hero: { $value: { value: 24, unit: "px" } },
    sheet: { $value: { value: 28, unit: "px" } },
    toon: { $value: { value: 10, unit: "px" } }
  },
  border: {
    $type: "dimension",
    toon: { $value: { value: 2, unit: "px" } }
  },
  shadow: {
    $description: "Hard offset shadows. They are plain CSS strings: the DTCG shadow type has no way to say 'a var() colour'.",
    blue: { $value: "4px 4px 0 #5f8dff" },
    red: { $value: "4px 4px 0 #f2706a" },
    yellow: { $value: "4px 4px 0 #ff94c8" },
    violet: { $value: "4px 4px 0 #a995f0" },
    lift: { $value: "6px 7px 0 var(--toon-shadow, #f2706a)" },
    press: { $value: "0 0 0 var(--toon-shadow, #f2706a)" }
  },
  ease: {
    $type: "cubicBezier",
    spring: { $value: [0.175, 0.885, 0.32, 1.275], $description: "House spring." },
    bounce: { $value: [0.34, 1.8, 0.5, 1], $description: "Toon overshoot." }
  },
  duration: {
    $type: "duration",
    fast: { $value: { value: 200, unit: "ms" } },
    normal: { $value: { value: 300, unit: "ms" } },
    slow: { $value: { value: 500, unit: "ms" } }
  }
};

// src/tokens.ts
var isLeaf = (n) => typeof n === "object" && n !== null && ("$value" in n);
function group(path) {
  let node = toonish_tokens_default;
  for (const part of path.split("."))
    node = node?.[part];
  if (!node || typeof node !== "object")
    throw new Error(`token group "${path}" does not exist`);
  const out = {};
  for (const [name, leaf] of Object.entries(node)) {
    if (name.startsWith("$"))
      continue;
    if (!isLeaf(leaf))
      throw new Error(`token "${path}.${name}" is not a token`);
    out[name] = css(leaf.$value, path, name);
  }
  return out;
}
var quote = (family) => /[\s]/.test(family) ? `"${family}"` : family;
function css(value, path, name) {
  if (typeof value === "string")
    return value;
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "number"))
      return `cubic-bezier(${value.join(",")})`;
    return value.map((v) => quote(String(v))).join(", ");
  }
  if (typeof value === "object" && value !== null && "value" in value && "unit" in value) {
    return `${value.value}${value.unit}`;
  }
  throw new Error(`token "${path}.${name}" has a value this reader does not know`);
}

// src/preset.ts
var bob = { "0%,60%,100%": { transform: "translateY(0)" }, "30%": { transform: "translateY(-.12em) rotate(-3deg)" } };
var squash = {
  "0%,100%": { transform: "scale(1,1)" },
  "20%": { transform: "scale(1.06,.92)" },
  "45%": { transform: "translateY(-10px) scale(.96,1.06)" }
};
var pop = { "0%": { transform: "scale(.6)", opacity: "0" }, "70%": { transform: "scale(1.08)" }, "100%": { transform: "scale(1)", opacity: "1" } };
var shadows = group("shadow");
var fonts = { ...group("font.size"), ...group("font.fluid") };
var preset = {
  theme: {
    extend: {
      colors: { toon: group("color") },
      fontFamily: Object.fromEntries(Object.entries(group("font.family")).map(([k, v]) => [k, v.split(", ")])),
      fontSize: fonts,
      spacing: group("space"),
      borderRadius: group("radius"),
      borderWidth: group("border"),
      boxShadow: Object.fromEntries(Object.entries(shadows).map(([k, v]) => [`toon-${k}`, v])),
      transitionTimingFunction: group("ease"),
      transitionDuration: group("duration"),
      keyframes: { bob, squash, pop },
      animation: {
        bob: "bob 2.4s cubic-bezier(.34,1.8,.5,1) infinite",
        squash: "squash 2.2s cubic-bezier(.34,1.8,.5,1) infinite",
        pop: "pop .5s cubic-bezier(.34,1.8,.5,1) both"
      }
    }
  }
};
var preset_default = preset;
export {
  preset_default as default
};

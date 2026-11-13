// Reads the DTCG token file into plain CSS strings. The preset and the Tailwind v4 theme both build from this,
// so there is one source for every value. Types follow the shapes used in tokens/toonish.tokens.json.
import tokenFile from '../tokens/toonish.tokens.json' with { type: 'json' };

type Leaf = { $value: unknown };
type Group = Record<string, unknown>;

const isLeaf = (n: unknown): n is Leaf => typeof n === 'object' && n !== null && '$value' in n;

/** The leaves of one group as name → CSS string, skipping `$type` and `$description`. */
export function group(path: string): Record<string, string> {
  let node: unknown = tokenFile;
  for (const part of path.split('.')) node = (node as Group)?.[part];
  if (!node || typeof node !== 'object') throw new Error(`token group "${path}" does not exist`);
  const out: Record<string, string> = {};
  for (const [name, leaf] of Object.entries(node as Group)) {
    if (name.startsWith('$')) continue;
    if (!isLeaf(leaf)) throw new Error(`token "${path}.${name}" is not a token`);
    out[name] = css(leaf.$value, path, name);
  }
  return out;
}

const quote = (family: string) => (/[\s]/.test(family) ? `"${family}"` : family);

function css(value: unknown, path: string, name: string): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    // fontFamily is an array of names; cubicBezier is an array of four numbers.
    if (value.every((v) => typeof v === 'number')) return `cubic-bezier(${value.join(',')})`;
    return value.map((v) => quote(String(v))).join(', ');
  }
  if (typeof value === 'object' && value !== null && 'value' in value && 'unit' in value) {
    return `${(value as { value: number }).value}${(value as { unit: string }).unit}`;
  }
  throw new Error(`token "${path}.${name}" has a value this reader does not know`);
}

import { mkdir, writeFile } from 'node:fs/promises';

const outputDirectory = new URL('../public/products/', import.meta.url);
const palettes = [
  ['#111827', '#818cf8', '#c4b5fd'],
  ['#172554', '#38bdf8', '#bae6fd'],
  ['#1c1917', '#fb923c', '#fed7aa'],
  ['#052e16', '#4ade80', '#bbf7d0'],
  ['#3b0764', '#e879f9', '#f5d0fe'],
  ['#431407', '#facc15', '#fef08a'],
];

const productShape = {
  'Audio Hardware': '<rect x="190" y="185" width="220" height="170" rx="38"/><path d="M215 235c0-155 170-155 170 0v55h-42v-55c0-94-86-94-86 0v55h-42z"/><circle cx="242" cy="292" r="20"/><circle cx="358" cy="292" r="20"/>',
  Peripherals: '<rect x="125" y="225" width="390" height="135" rx="22"/><path d="M155 255h330M155 290h330M155 325h330"/><path d="M190 240v105M235 240v105M280 240v105M325 240v105M370 240v105M415 240v105M460 240v105"/>',
  Wearables: '<rect x="230" y="120" width="180" height="280" rx="46"/><rect x="255" y="170" width="130" height="180" rx="22"/><path d="M270 100v35M370 100v35M270 405v35M370 405v35"/>',
  Accessories: '<path d="M175 230h290l-30 190H205z"/><path d="M245 230c0-120 150-120 150 0M215 275h210"/>',
};

const escapeXml = (value) => value.replace(/[<&>"]/g, character => ({
  '<': '&lt;', '&': '&amp;', '>': '&gt;', '"': '&quot;',
}[character]));

await mkdir(outputDirectory, { recursive: true });

for (let index = 0; index < 500; index += 1) {
  const productId = `PROD-${101 + index}`;
  const category = ['Audio Hardware', 'Peripherals', 'Wearables', 'Accessories'][index % 4];
  const [background, primary, highlight] = palettes[index % palettes.length];
  const label = escapeXml(`${category} ${String(index + 1).padStart(3, '0')}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="#080711"/></linearGradient></defs>
<rect width="640" height="480" fill="url(#bg)"/><circle cx="${80 + (index * 37) % 500}" cy="${80 + (index * 19) % 300}" r="150" fill="${primary}" opacity=".12"/>
<g fill="none" stroke="${primary}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">${productShape[category]}</g>
<g fill="${highlight}" font-family="Arial,sans-serif"><text x="42" y="54" font-size="18" font-weight="700" letter-spacing="3">NORTHSTAR SUPPLY</text><text x="42" y="430" font-size="20" font-weight="600">${label}</text><text x="42" y="456" font-size="13" opacity=".75">${escapeXml(productId)} · ${escapeXml(category)}</text></g>
</svg>`;
  await writeFile(new URL(`${productId}.svg`, outputDirectory), svg);
}

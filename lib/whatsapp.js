// Pre-filled WhatsApp messages (spec §2.11.3, §3.8, §5.8).
// The page URL sits on its own line so WhatsApp unfurls it and shows that page's OG image.

export const waLink = (number, text) => `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

export function vehicleMessage({ name, category, url }) {
  return [
    'Hello DreamWheels,',
    '',
    "I'm interested in the following vehicle:",
    '',
    `Vehicle: ${name}`,
    `Category: ${category}`,
    `Link: ${url}`,
    '',
    'Source: Vintage Vehicles Marketplace',
    'Please share further details.',
  ].join('\n');
}

export function partMessage({ name, sku, url }) {
  return [
    'Hello DreamWheels,',
    '',
    "I'm interested in the following spare part:",
    '',
    `Product: ${name}`,
    sku ? `SKU: ${sku}` : null,
    `Link: ${url}`,
    '',
    'Source: Spare Parts',
    'Please confirm price and availability.',
  ]
    .filter((l) => l !== null)
    .join('\n');
}

export function restorationMessage({ vehicleType, model, year, url }) {
  return [
    'Hello DreamWheels,',
    '',
    "I'd like to discuss a restoration:",
    '',
    `Vehicle type: ${vehicleType || '-'}`,
    `Model: ${model || '-'}`,
    `Year: ${year || '-'}`,
    `Link: ${url}`,
    '',
    'Source: Restoration Request',
  ].join('\n');
}

export function sellMessage({ vehicleType, url }) {
  return [
    'Hello DreamWheels,',
    '',
    `I'd like to sell my ${vehicleType ? vehicleType.toLowerCase() : 'vehicle'} through DreamWheels.`,
    `Link: ${url}`,
    '',
    'Source: Sell Your Vehicle',
  ].join('\n');
}

export function generalMessage({ url, source = 'Website' }) {
  return ['Hello DreamWheels,', '', "I'm looking for something rare and would like to speak with a specialist.", `Link: ${url}`, '', `Source: ${source}`].join('\n');
}

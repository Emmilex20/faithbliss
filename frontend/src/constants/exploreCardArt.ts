const svgUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export const EXPLORE_CARD_ART = [
  svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#64113f"/><stop offset="55%" stop-color="#9d174d"/><stop offset="100%" stop-color="#1f2937"/></linearGradient></defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <rect x="28" y="72" width="132" height="188" rx="20" fill="#ffffff16"/>
      <rect x="178" y="54" width="194" height="222" rx="24" fill="#ffffff12"/>
      <circle cx="220" cy="176" r="42" fill="#f6d1bf"/>
      <path d="M176 230h88v170h-88z" fill="#d1d5db"/>
      <path d="M158 246h34v144h-34z" fill="#9ca3af"/>
      <path d="M248 246h34v144h-34z" fill="#9ca3af"/>
      <path d="M220 224l28 112h-56z" fill="#111827"/>
      <rect x="188" y="400" width="28" height="112" rx="14" fill="#111827"/>
      <rect x="224" y="400" width="28" height="112" rx="14" fill="#111827"/>
      <rect x="0" y="470" width="400" height="90" fill="#00000026"/>
    </svg>
  `),
  svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f3b57"/><stop offset="55%" stop-color="#0e7490"/><stop offset="100%" stop-color="#172554"/></linearGradient></defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <circle cx="132" cy="198" r="38" fill="#f3cfbe"/>
      <rect x="95" y="235" width="74" height="140" rx="26" fill="#f8fafc"/>
      <circle cx="272" cy="190" r="36" fill="#f1c7b3"/>
      <rect x="236" y="225" width="72" height="146" rx="24" fill="#e2e8f0"/>
      <rect x="183" y="204" width="34" height="170" rx="10" fill="#f8fafc"/>
      <rect x="168" y="272" width="64" height="20" rx="8" fill="#f8fafc"/>
      <circle cx="200" cy="160" r="24" fill="#fde68a"/>
      <rect x="0" y="470" width="400" height="90" fill="#00000024"/>
    </svg>
  `),
  svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0b3d1f"/><stop offset="55%" stop-color="#15803d"/><stop offset="100%" stop-color="#1f2937"/></linearGradient></defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <rect x="44" y="110" width="228" height="170" rx="22" fill="#ffffff16"/>
      <rect x="68" y="138" width="180" height="18" rx="9" fill="#ffffff24"/>
      <rect x="68" y="172" width="160" height="18" rx="9" fill="#ffffff1f"/>
      <rect x="68" y="206" width="138" height="18" rx="9" fill="#ffffff1b"/>
      <circle cx="308" cy="214" r="42" fill="#f3cfbe"/>
      <path d="M266 258h86v148h-86z" fill="#d1d5db"/>
      <path d="M110 326l70-38 70 38-70 38z" fill="#111827"/>
      <path d="M180 364v42" stroke="#111827" stroke-width="10" stroke-linecap="round"/>
      <rect x="0" y="470" width="400" height="90" fill="#00000022"/>
    </svg>
  `),
  svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7c2d12"/><stop offset="55%" stop-color="#ea580c"/><stop offset="100%" stop-color="#1f2937"/></linearGradient></defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <rect x="56" y="92" width="292" height="198" rx="26" fill="#00000020"/>
      <rect x="82" y="118" width="236" height="146" rx="20" fill="#ffffff14"/>
      <circle cx="148" cy="208" r="32" fill="#f1c8b6"/>
      <path d="M116 242h64v116h-64z" fill="#fca5a5"/>
      <circle cx="258" cy="160" r="18" fill="#ffffffc8"/>
      <rect x="240" y="182" width="36" height="84" rx="12" fill="#ffffffb2"/>
      <path d="M258 222l54-40" stroke="#ffffffb2" stroke-width="14" stroke-linecap="round"/>
      <rect x="206" y="316" width="108" height="72" rx="14" fill="#111827"/>
      <polygon points="246,334 246,370 278,352" fill="#f8fafc"/>
      <rect x="0" y="470" width="400" height="90" fill="#00000024"/>
    </svg>
  `),
  svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#713f12"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#1f2937"/></linearGradient></defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <circle cx="138" cy="182" r="38" fill="#efcab6"/>
      <path d="M98 220h80v138h-80z" fill="#f8fafc"/>
      <path d="M186 286l114-32v146l-114 34z" fill="#fef3c7"/>
      <path d="M186 286l-86-30v144l86 34z" fill="#fff7ed"/>
      <path d="M186 286v150" stroke="#b45309" stroke-width="4"/>
      <path d="M118 278v118" stroke="#b45309" stroke-width="3"/>
      <path d="M254 268v120" stroke="#b45309" stroke-width="3"/>
      <rect x="0" y="470" width="400" height="90" fill="#00000020"/>
    </svg>
  `),
  svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="55%" stop-color="#2563eb"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <circle cx="116" cy="194" r="40" fill="#f2c8b4"/>
      <path d="M74 236h84v150H74z" fill="#f8fafc"/>
      <rect x="206" y="174" width="118" height="184" rx="24" fill="#ffffff14"/>
      <path d="M214 286c34-40 74-64 126-78" stroke="#f8fafc" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M208 306c52 10 94 8 136-6" stroke="#f8fafc" stroke-width="12" fill="none" stroke-linecap="round"/>
      <rect x="86" y="392" width="62" height="34" rx="10" fill="#94a3b8"/>
      <circle cx="302" cy="124" r="22" fill="#dbeafe"/>
      <rect x="0" y="470" width="400" height="90" fill="#00000022"/>
    </svg>
  `),
  svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7f1d1d"/><stop offset="55%" stop-color="#dc2626"/><stop offset="100%" stop-color="#1f2937"/></linearGradient></defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <circle cx="244" cy="154" r="34" fill="#efc8b5"/>
      <path d="M226 190l-34 84 58 18 34-62z" fill="#fdba74"/>
      <path d="M190 272l-46 98" stroke="#fdba74" stroke-width="24" stroke-linecap="round"/>
      <path d="M248 290l76 60" stroke="#fdba74" stroke-width="24" stroke-linecap="round"/>
      <path d="M216 236l-96-10" stroke="#fdba74" stroke-width="20" stroke-linecap="round"/>
      <path d="M270 216l58-50" stroke="#fdba74" stroke-width="20" stroke-linecap="round"/>
      <rect x="86" y="364" width="38" height="20" rx="8" fill="#111827"/>
      <rect x="322" y="344" width="38" height="20" rx="8" fill="#111827"/>
      <rect x="0" y="470" width="400" height="90" fill="#00000024"/>
    </svg>
  `),
  svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#581c87"/><stop offset="55%" stop-color="#db2777"/><stop offset="100%" stop-color="#1f2937"/></linearGradient></defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <circle cx="150" cy="194" r="40" fill="#f3c9b5"/>
      <path d="M110 238h80v150h-80z" fill="#f9a8d4"/>
      <rect x="264" y="150" width="22" height="176" rx="11" fill="#f8fafc"/>
      <circle cx="275" cy="136" r="28" fill="#f8fafc"/>
      <path d="M74 172c18-34 44-36 54-6" stroke="#ffffff96" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M298 208c30-24 48 10 24 28" stroke="#ffffff96" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M318 178c26-18 44 6 24 20" stroke="#ffffff72" stroke-width="5" fill="none" stroke-linecap="round"/>
      <rect x="0" y="470" width="400" height="90" fill="#00000024"/>
    </svg>
  `),
];

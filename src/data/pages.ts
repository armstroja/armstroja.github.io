export interface PageData {
  id: number;
  label: string;
  headline: string;
  subheadline?: string;
  body: string;
  year?: string;
  tag?: string;
  layout: 'title' | 'editorial' | 'archive' | 'split' | 'minimal';
  bg: string;       // background colour
  fg: string;       // foreground / text colour
  accent: string;   // accent colour
}

export const pages: PageData[] = [
  {
    id: 0,
    label: '00 — Index',
    headline: 'JAACCK',
    subheadline: 'Design Archive',
    body: 'A curated collection of work at the intersection of identity, editorial, and spatial design.',
    year: 'MMXXIV',
    tag: 'Portfolio',
    layout: 'title',
    bg: '#0a0a0a',
    fg: '#f5f2ed',
    accent: '#8a8680',
  },
  {
    id: 1,
    label: '01 — Identity',
    headline: 'BRAND\nSYSTEMS',
    subheadline: 'Identity Design',
    body: 'Building visual languages that endure. Marks, systems, and the grammar of recognition — designed for longevity over trend.',
    year: '2023–24',
    tag: 'Branding',
    layout: 'editorial',
    bg: '#f5f2ed',
    fg: '#0a0a0a',
    accent: '#2a2825',
  },
  {
    id: 2,
    label: '02 — Editorial',
    headline: 'PRINT\n& SCREEN',
    subheadline: 'Editorial Design',
    body: 'Typography as architecture. Grid systems as rhythm. Every margin, every leading — a deliberate decision in service of the reader.',
    year: '2022–24',
    tag: 'Typography',
    layout: 'archive',
    bg: '#ede9e2',
    fg: '#0a0a0a',
    accent: '#8a8680',
  },
  {
    id: 3,
    label: '03 — Spatial',
    headline: 'SPACE\n& FORM',
    subheadline: 'Spatial & 3D',
    body: 'Design that occupies volume. From exhibition identities to 3D environments — material thinking applied to digital space.',
    year: '2023',
    tag: 'Spatial',
    layout: 'split',
    bg: '#1a1816',
    fg: '#f5f2ed',
    accent: '#8a8680',
  },
  {
    id: 4,
    label: '04 — Contact',
    headline: 'LET\'S\nTALK.',
    subheadline: 'Get in Touch',
    body: 'Available for select projects. New work, collaborations, and conversations — always welcome.',
    year: 'Open',
    tag: 'jaacck.me',
    layout: 'minimal',
    bg: '#0a0a0a',
    fg: '#f5f2ed',
    accent: '#8a8680',
  },
];

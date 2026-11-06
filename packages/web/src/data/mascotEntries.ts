export interface MascotEntry {
  id: string
  label: string
  image: string
  /** A square crop for thumbnails and cards; the zoom dialog always shows `image`, the full art. */
  preview?: string
  alt: string
  /** Tiny pixel art: scale it up without smoothing (image-rendering: pixelated). */
  pixelArt?: boolean
}

export const MASCOT_ENTRIES: readonly MascotEntry[] = [
  {
    id: 'art_001',
    label: 'Entry 1',
    image: '/assets/mascot-vote/art_001.jpg',
    alt: 'Kit da Kat, a cat in a dark balaclava, beside Butler Poo, a brown character with a monocle and moustache',
  },
  {
    id: 'art_002',
    label: 'Entry 2',
    image: '/assets/mascot-vote/art_002.jpg',
    preview: '/assets/mascot-vote/art_002-face.jpg',
    alt: 'Grey cat in a brown beanie and blue jumper holding a baseball bat',
  },
  {
    id: 'art_003',
    label: 'Entry 3',
    image: '/assets/mascot-vote/art_003.png',
    alt: 'Small orange pixel-art slime cat with a striped tail',
    pixelArt: true,
  },
  {
    id: 'art_004',
    label: 'Entry 4',
    image: '/assets/mascot-vote/art_004.png',
    alt: 'Pixel-art orange fox head in a leather aviator cap with cracked goggles',
    pixelArt: true,
  },
  {
    id: 'art_005',
    label: 'Entry 5',
    image: '/assets/mascot-vote/art_005.jpg',
    alt: 'Green cartoon cactus with its brain showing',
  },
  {
    id: 'art_006',
    label: 'Entry 6',
    image: '/assets/mascot-vote/art_006.jpg',
    alt: 'Yellow cartoon fox head in a blue cap',
  },
]

/** The art a thumbnail or card shows: the square crop when there is one, else the full image. */
export function previewOf(entry: MascotEntry): string {
  return entry.preview ?? entry.image
}

export function getMascotEntry(id: string): MascotEntry | undefined {
  return MASCOT_ENTRIES.find((entry) => entry.id === id)
}

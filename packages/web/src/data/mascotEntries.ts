export interface MascotEntry {
  id: string
  label: string
  image: string
  alt: string
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
    alt: 'Grey cat in a brown beanie and blue jumper holding a baseball bat',
  },
  {
    id: 'art_003',
    label: 'Entry 3',
    image: '/assets/mascot-vote/art_003.png',
    alt: 'Small orange pixel-art slime cat with a striped tail',
  },
  {
    id: 'art_004',
    label: 'Entry 4',
    image: '/assets/mascot-vote/art_004.png',
    alt: 'Pixel-art orange fox head in a leather aviator cap with cracked goggles',
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

export function getMascotEntry(id: string): MascotEntry | undefined {
  return MASCOT_ENTRIES.find((entry) => entry.id === id)
}

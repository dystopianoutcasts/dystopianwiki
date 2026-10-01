import type { MascotEntry } from '../../data/mascotEntries'

/** An entry's art; pixel-art entries are scaled up without smoothing. */
export function ArtImage({ entry, alt, className }: { entry: MascotEntry; alt: string; className?: string }) {
  const cls = [className, entry.pixelArt ? 'mascot-vote__pixel' : ''].filter(Boolean).join(' ')
  return <img className={cls || undefined} src={entry.image} alt={alt} draggable={false} />
}

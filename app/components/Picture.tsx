"use client"

export function Picture({ basePath, alt, className }: { basePath: string, alt: string, className?: string }) {
  // basePath without extension, e.g., /images/rooms/entrance
  const webp = `${basePath}.webp`
  const png = `${basePath}.png`
  const jpg = `${basePath}.jpg`
  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img src={jpg} onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = png }} alt={alt} className={className} />
    </picture>
  )
}

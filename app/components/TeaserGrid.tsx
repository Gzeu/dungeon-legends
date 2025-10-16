"use client"
import Image from 'next/image'

export default function TeaserGrid() {
  return (
    <div className="teaser">
      <div className="tile">
        <Image src="/images/teaser-dungeon.png" alt="Dungeon teaser" fill priority sizes="(min-width:768px) 50vw, 100vw" />
      </div>
      <div className="tile">
        <Image src="/images/teaser-guild.png" alt="Guild teaser" fill sizes="(min-width:768px) 50vw, 100vw" />
      </div>
    </div>
  )
}

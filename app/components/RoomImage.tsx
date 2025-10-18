"use client"
import { Picture } from '@/app/components/Picture'

export default function RoomImage({ name, path }: { name: string, path: string }) {
  const base = path.replace(/\.(png|jpg|jpeg)$/i, '')
  return (
    <div className="room-image">
      <Picture basePath={base} alt={name} />
    </div>
  )
}

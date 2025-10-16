"use client"
import RoomImage from '@/app/components/RoomImage'

export default function RoomSection({ room }: { room: any }) {
  return (
    <section>
      <h3 className="room-name">{room.name}</h3>
      {room.backgroundImage && (
        <RoomImage name={room.name} path={room.backgroundImage} />
      )}
    </section>
  )
}

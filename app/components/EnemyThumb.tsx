"use client"
import { Picture } from '@/app/components/Picture'

export default function EnemyThumb({ name, path }: { name: string, path: string }) {
  const base = path.replace(/\.(png|jpg|jpeg)$/i, '')
  return <img src={`${base}.jpg`} alt={name} width={86} height={86} style={{ objectFit:'cover', borderRadius: 10 }} />
  // If desired later: <Picture basePath={base} alt={name} />
}

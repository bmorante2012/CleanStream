'use client'

interface ShareBoxProps {
  slug: string
}

export default function ShareBox({ slug }: ShareBoxProps) {
  const url = typeof window !== 'undefined'
    ? window.location.href
    : `${process.env.NEXT_PUBLIC_BASE_URL || ''}/watch/${slug}`

  return (
    <div className="p-4 bg-[var(--secondary)] rounded-lg">
      <h3 className="font-medium mb-2">Share this Sync Pack</h3>
      <input
        type="text"
        readOnly
        value={url}
        className="w-full px-3 py-2 border border-[var(--input)] rounded-lg bg-[var(--background)] text-sm"
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
    </div>
  )
}

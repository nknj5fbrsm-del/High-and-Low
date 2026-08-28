export function LeaveRoomButton({ onLeave }: { onLeave: () => void }) {
  return (
    <button
      type="button"
      onClick={onLeave}
      className="h-14 w-full rounded-2xl border-2 border-zinc-400 bg-zinc-900 text-lg font-bold text-white"
    >
      Raum verlassen
    </button>
  )
}

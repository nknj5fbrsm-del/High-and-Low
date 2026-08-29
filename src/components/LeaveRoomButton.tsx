export function LeaveRoomButton({ onLeave }: { onLeave: () => void }) {
  return (
    <button type="button" onClick={onLeave} className="tab-btn tab-btn-ghost h-14 w-full">
      Tisch verlassen
    </button>
  )
}

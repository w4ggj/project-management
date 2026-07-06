import { Status } from '@/types'
import { STATUS_COLORS } from '@/lib/utils'

export default function StatusBadge({ status }: { status: Status }) {
  const c = STATUS_COLORS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

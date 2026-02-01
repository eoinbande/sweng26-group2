import React from "react"
import { Clock, Pencil } from "lucide-react"

export function TaskCard({ title, dueDate, onEdit }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-sm)',
      padding: 'var(--space-md) var(--space-md) var(--space-xl) var(--space-md)',
      backgroundColor: 'var(--card-bg)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
      minWidth: '250px',
    }}>
      {/* Text content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        marginLeft : 'var(--space-md)', 
      }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-main)',
        }}>{title}</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}>
          <Clock size={14} strokeWidth={2} />
          <span>{dueDate}</span>
        </div>
      </div>

      {/* Edit button */}
      <button
        type="button"
        onClick={onEdit}
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '8px',
          height: '36px',
          width: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--text-main)',
          cursor: 'pointer',
        }}
      >
        <Pencil size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}

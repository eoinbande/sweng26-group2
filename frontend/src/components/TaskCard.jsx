import React from "react"
import { Clock, Pencil, Check, X } from "lucide-react"

export function TaskCard({
  title,
  dueDate,
  onEdit,
  variant = "default", // "default" or "review"
  subtasks = [],
  onConfirm = () => console.log("Task confirmed:", title),
  onDeny = () => console.log("Task denied:", title),
}) {
  const isReviewVariant = variant === "review";

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      padding: 'var(--space-md)',
      backgroundColor: 'var(--card-bg)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
      width: '100%',
      minWidth: 'auto',
      maxWidth: '400px',
      boxSizing: 'border-box',
      minHeight: '100px',
    }}>
      {/* review variant: confirm/deny buttons floating on left */}
      {isReviewVariant && (
        <div style={{
          position: 'absolute',
          left: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
        }}>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Check size={20} color="white" strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={onDeny}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-red-soft)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <X size={20} color="white" strokeWidth={3} />
          </button>
        </div>
      )}

      {/* text content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        marginLeft: 'var(--space-sm)',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-main)',
          lineHeight: '1.3',
          marginBottom: 'var(--space-xs)',
        }}>{title}</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          <Clock size={12} strokeWidth={2} />
          <span>{dueDate}</span>
        </div>

        {/* subtasks (read-only list, matches TaskTimeline styling) */}
        {subtasks.length > 0 && (
          <div style={{
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            borderTop: '1px solid #F0F0EC',
            paddingTop: '8px',
          }}>
            {subtasks.map((sub) => (
              <div key={sub.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                backgroundColor: '#F9F9F7',
                minHeight: '36px',
              }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: 0,
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: 'var(--text-main)',
                    fontWeight: 400,
                  }}>{sub.title}</span>
                  {sub.dueDate && (
                    <span style={{
                      fontSize: '11px',
                      color: '#8E8E93',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}>
                      <Clock size={10} strokeWidth={2} />
                      {sub.dueDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* edit button (commented out — not needed for now)
      <button
        type="button"
        onClick={onEdit}
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          height: '32px',
          width: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--text-main)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Pencil size={14} strokeWidth={2.5} />
      </button>
      */}
    </div>
  )
}

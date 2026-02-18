import React, { useState } from "react"
import { Clock, ChevronDown, Check, X } from "lucide-react"

export function TaskCard({
  title,
  dueDate,
  onEdit,
  order,
  variant = "default", // "default" or "review"
  subtasks = [],
  onConfirm = () => console.log("Task confirmed:", title),
  onDeny = () => console.log("Task denied:", title),
}) {
  const isReviewVariant = variant === "review";
  const [showSubtasks, setShowSubtasks] = useState(false);

  return (
    <div className="cg-task-card" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      backgroundColor: 'var(--card-bg)',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
      width: '100%',
      minWidth: 'auto',
      maxWidth: '400px',
      boxSizing: 'border-box',
    }}>
      {/* review variant: confirm/deny buttons floating on left */}
      {isReviewVariant && (
        <div style={{
          position: 'absolute',
          left: '-20px',
          top: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
        }}>
          <button
            type="button"
            className="cg-task-action-btn"
            onClick={onConfirm}
            style={{
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
            className="cg-task-action-btn"
            onClick={onDeny}
            style={{
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
        <span className="cg-task-title" style={{
          fontWeight: 600,
          color: 'var(--text-main)',
          lineHeight: '1.3',
        }}>
          {order != null && (
            <span style={{ color: 'var(--accent-red-soft)', marginRight: '4px' }}>{order}.</span>
          )}
          {title}
        </span>
        <div className="cg-task-due" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          <Clock size={12} strokeWidth={2} />
          <span>{dueDate}</span>
        </div>

        {/* subtasks dropdown */}
        {subtasks.length > 0 && (
          <div style={{
            marginTop: showSubtasks ? '8px' : '0px',
            display: 'flex',
            flexDirection: 'column',
            gap: showSubtasks ? '6px' : '0px',
            borderTop: showSubtasks ? '1px solid #F0F0EC' : '1px solid transparent',
            paddingTop: showSubtasks ? '8px' : '0px',
            maxHeight: showSubtasks ? `${subtasks.length * 60}px` : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.4s ease-out, margin-top 0.3s ease-out, padding-top 0.3s ease-out, gap 0.3s ease-out, border-color 0.3s ease-out',
          }}>
            {subtasks.map((sub, index) => (
              <div key={sub.id} className="cg-task-subtask" style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F9F9F7',
                position: 'relative',
                opacity: showSubtasks ? 1 : 0,
                transform: showSubtasks ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s ease-out ${index * 0.1}s`,
              }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: 0,
                }}>
                  <span className="cg-task-subtask-title" style={{
                    color: 'var(--text-main)',
                    fontWeight: 400,
                  }}>{sub.title}</span>
                  {sub.dueDate && (
                    <span className="cg-task-subtask-due" style={{
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
                {order != null && sub.order != null && (
                  <span className="cg-task-subtask-order" style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '10px',
                    fontWeight: 500,
                    color: '#8E8E93',
                  }}>
                    {order}.{sub.order}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* dropdown arrow to toggle subtasks */}
      {subtasks.length > 0 && (
        <button
          type="button"
          className="cg-task-chevron"
          onClick={() => setShowSubtasks(!showSubtasks)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
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
          <ChevronDown
            size={16}
            strokeWidth={2.5}
            style={{
              transition: 'transform 0.2s ease',
              transform: showSubtasks ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>
      )}
    </div>
  )
}

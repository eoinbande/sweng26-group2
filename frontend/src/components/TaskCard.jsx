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
      {/* review variant: confirm/deny buttons floating on left
      {isReviewVariant && (
        <div className="cg-task-action-group" style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
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
      )} */}

      {/* text content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
        padding: '12px',
      }}>
        <div style={{ marginRight: subtasks.length > 0 ? 'clamp(30px, 4.5dvh, 36px)' : '0' }}>
            <div className="cg-task-title" style={{
              fontWeight: 600,
              color: 'var(--text-main)',
              lineHeight: '1.3',
              wordBreak: 'break-word', // Ensure long words break
            }}>
              {order != null && (
                <span style={{ color: 'var(--accent-red-soft)', marginRight: '4px' }}>{order}.</span>
              )}
              <span>{title}</span>
            </div>
            {dueDate && (
             <div className="cg-task-due" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              flexShrink: 0,
            }}>
              <Clock size={12} strokeWidth={2} />
              <span>{dueDate}</span>
            </div>
            )}
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
            maxHeight: showSubtasks ? `${subtasks.length * 300}px` : '0px', // Allow enough space for wrapping text
            overflow: 'hidden',
            transition: 'max-height 0.4s ease-out, margin-top 0.3s ease-out, padding-top 0.3s ease-out, gap 0.3s ease-out, border-color 0.3s ease-out',
          }}>
            {subtasks.map((sub, index) => (
              <div key={sub.id} className="cg-task-subtask" style={{
                display: 'flex',
                alignItems: 'flex-start',
                backgroundColor: '#F9F9F7',
                position: 'relative',
                opacity: showSubtasks ? 1 : 0,
                transform: showSubtasks ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s ease-out ${index * 0.1}s`,
                padding: '12px',
                borderRadius: '10px',
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
                    wordBreak: 'break-word',
                  }}>{sub.title}</span>
                  {sub.dueDate && (
                    <span className="cg-task-subtask-due" style={{
                      color: '#8E8E93',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px', // Add slight spacing from title
                    }}>
                      <Clock size={10} strokeWidth={2} style={{ flexShrink: 0 }} />
                      <span style={{ wordBreak: 'break-word' }}>{sub.dueDate}</span>
                    </span>
                  )}
                </div>
                {order != null && sub.order != null && (
                  <span className="cg-task-subtask-order" style={{
                    marginLeft: '8px',
                    fontWeight: 500,
                    color: '#8E8E93',
                    alignSelf: 'center', // Center vertically relative to the block
                    flexShrink: 0,
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

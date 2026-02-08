import React from 'react';
import '../index.css';
import { InputBar } from './InputBar';
import { Mic } from 'lucide-react';

export default function FeedbackPopUp({ variant, onClose, onSubmit }) {
  return (
    
    <div className="card" style={{
                background: 'var(--accent-blue)',
                padding: 'var(--space-lg)',
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
          }}>
      <h3 style={{ marginBottom: 'var(--space-sm)' }}>{variant === 'roadblock' ? 'Roadblock Detected' : 'Change Detected'}</h3>
      <p style={{ marginBottom: 'var(--space-md)' }}>Please describe the issue or change:</p>
      <InputBar variant="auth" placeholder="Describe the feedback..." onSubmit={onSubmit}
       icon={<Mic size={18} color="white" />}
        buttonStyle="dark"
        padding="12px 14px"
borderRadius="var(--radius-lg)"/>
    </div>
  );
}
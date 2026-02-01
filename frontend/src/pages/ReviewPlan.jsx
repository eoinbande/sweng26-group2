import React, { useState } from 'react';
import { ArrowRight, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { TaskCard } from '../components/TaskCard';
import '../index.css';

function ReviewPlan() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '480px',
            margin: '0 auto',
            overflow: 'hidden',
        }}>
            <main style={{
                flex: 1,
                backgroundColor: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-lg)',
                paddingBottom: '100px',
            }}>
                <div style={{ width: '100%' }}>
                    <TaskCard
                        title="Learn the keyboard layout"
                        dueDate="Tomorrow"
                        onEdit={() => console.log("Edit clicked")}
                    />
                </div>
            </main>
            <BottomNav />
        </div>
    );
}

export default ReviewPlan;
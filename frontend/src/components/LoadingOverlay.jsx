import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

// loading overlay component for transitioning between pages
function LoadingOverlay({ onComplete }) {
    const navigate = useNavigate();

    const phrases = [
        "Quantexing...",
        "Breaking down your goal...",
        "Creating actionable steps...",
        "Organizing your journey...",
        "Crafting your plan..."
    ];

    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [isTextVisible, setIsTextVisible] = useState(false);
    const [isShrinking, setIsShrinking] = useState(false);

    return null;
}

export default LoadingOverlay;

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

    useEffect(() => {
        // fade in text after initial mount
        const fadeInTimer = setTimeout(() => {
            setIsTextVisible(true);
        }, 100);

        // cycle through phrases
        const cycleInterval = setInterval(() => {
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 1500);

        // start shrinking animation after showing phrases
        const shrinkTimer = setTimeout(() => {
            setIsTextVisible(false);
        }, 3500);

        // begin card shrink
        const transitionTimer = setTimeout(() => {
            setIsShrinking(true);
        }, 4000);

        // notify parent that loading is complete
        const completeTimer = setTimeout(() => {
            onComplete?.();
        }, 5500);

        return () => {
            clearTimeout(fadeInTimer);
            clearInterval(cycleInterval);
            clearTimeout(shrinkTimer);
            clearTimeout(transitionTimer);
            clearTimeout(completeTimer);
        };
    }, [phrases.length, onComplete]);

    return null;
}

export default LoadingOverlay;

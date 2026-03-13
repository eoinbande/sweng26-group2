import { useState, useMemo } from 'react';
import { PartyPopper, Star, X } from 'lucide-react';
import '../styles/components/Congratulations.css';

// color themes matching the goal card color schemes
const COLOR_THEMES = {
    blue: {
        banner: 'linear-gradient(135deg, #BFD1E5, #d4e2f0, #BFD1E5)',
        button: '#BFD1E5',
        buttonShadow: 'rgba(191, 209, 229, 0.4)',
        buttonShadowHover: 'rgba(191, 209, 229, 0.5)',
        icon: '#BFD1E5',
        confetti: ['#BFD1E5', '#DCE3E9', '#A7DD99', '#FACB6E', '#FFC5C4'],
    },
    yellow: {
        banner: 'linear-gradient(135deg, #facb6e, #f7d88a, #facb6e)',
        button: '#facb6e',
        buttonShadow: 'rgba(250, 203, 110, 0.4)',
        buttonShadowHover: 'rgba(250, 203, 110, 0.5)',
        icon: '#facb6e',
        confetti: ['#FACB6E', '#DD645F', '#A7DD99', '#AECBFA', '#FFC5C4'],
    },
    green: {
        banner: 'linear-gradient(135deg, #69995D, #8ab87e, #69995D)',
        button: '#69995D',
        buttonShadow: 'rgba(105, 153, 93, 0.4)',
        buttonShadowHover: 'rgba(105, 153, 93, 0.5)',
        icon: '#69995D',
        confetti: ['#9bd08f', '#69995D', '#FACB6E', '#BFD1E5', '#FFC5C4'],
    },
    pink: {
        banner: 'linear-gradient(135deg, #FFC5C4, #ffd9d8, #FFC5C4)',
        button: '#FFC5C4',
        buttonShadow: 'rgba(255, 197, 196, 0.4)',
        buttonShadowHover: 'rgba(255, 197, 196, 0.5)',
        icon: '#FFC5C4',
        confetti: ['#FFC5C4', '#DD645F', '#FACB6E', '#BFD1E5', '#A7DD99'],
    },
};

// generate randomized confetti pieces
const generateConfetti = (count, colors) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 1.5,
        duration: 2 + Math.random() * 2,
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
    }));
};

const Congratulations = ({ isOpen, onClose, goalTitle = '', colorScheme = 'yellow' }) => {
    const [closing, setClosing] = useState(false);
    const theme = COLOR_THEMES[colorScheme] || COLOR_THEMES.yellow;
    const confettiPieces = useMemo(() => generateConfetti(30, theme.confetti), [isOpen, colorScheme]);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose();
        }, 250);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* confetti layer */}
            <div className="congrats-confetti">
                {confettiPieces.map((piece) => (
                    <div
                        key={piece.id}
                        className="congrats-confetti-piece"
                        style={{
                            left: `${piece.left}%`,
                            width: `${piece.size}px`,
                            height: `${piece.size}px`,
                            backgroundColor: piece.color,
                            animationDelay: `${piece.delay}s`,
                            animationDuration: `${piece.duration}s`,
                            transform: `rotate(${piece.rotation}deg)`,
                        }}
                    />
                ))}
            </div>

            {/* popup overlay */}
            <div className={`congrats-overlay${closing ? ' closing' : ''}`}>
                <div className="congrats-backdrop" onClick={handleClose} />

                <div className="congrats-popup">
                    {/* close button */}
                    <button className="congrats-close-btn" onClick={handleClose}>
                        <X size={18} />
                    </button>

                    {/* themed banner */}
                    <div
                        className="congrats-banner"
                        style={{ background: theme.banner }}
                    >
                        {/* decorative circles */}
                        <div className="congrats-banner-circle congrats-banner-circle-1" />
                        <div className="congrats-banner-circle congrats-banner-circle-2" />
                        <div className="congrats-banner-circle congrats-banner-circle-3" />

                        {/* animated stars */}
                        <div className="congrats-star congrats-star-1">
                            <Star size={20} fill="#fff" stroke="none" />
                        </div>
                        <div className="congrats-star congrats-star-2">
                            <Star size={14} fill="#fff" stroke="none" />
                        </div>
                        <div className="congrats-star congrats-star-3">
                            <Star size={12} fill="#fff" stroke="none" />
                        </div>

                        {/* icon */}
                        <div className="congrats-icon-circle">
                            <PartyPopper size={36} style={{ color: theme.icon }} />
                        </div>
                    </div>

                    {/* content */}
                    <div className="congrats-content">
                        <h2 className="congrats-title">Congratulations!</h2>
                        <p className="congrats-subtitle">
                            You've successfully completed your goal
                        </p>

                        {/* goal name pill */}
                        <div className="congrats-goal-pill">
                            <p>{goalTitle}</p>
                        </div>

                        {/* progress bar */}
                        <div className="congrats-progress-row">
                            <div className="congrats-progress-track">
                                <div className="congrats-progress-fill" />
                            </div>
                            <span className="congrats-progress-label">100%</span>
                        </div>

                        {/* continue button */}
                        <button
                            className="congrats-continue-btn"
                            style={{
                                backgroundColor: theme.button,
                                boxShadow: `0 4px 12px ${theme.buttonShadow}`,
                            }}
                            onClick={handleClose}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Congratulations;

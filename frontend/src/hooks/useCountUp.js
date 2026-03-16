import { useState, useEffect, useRef } from 'react';

// animates a number from 0 to target over duration, returns { value, blur }
const useCountUp = (target, duration = 800, shouldStart = false) => {
    const [value, setValue] = useState(0);
    const [progress, setProgress] = useState(0);
    const frameRef = useRef(null);

    useEffect(() => {
        if (!shouldStart || target === 0) {
            if (shouldStart) { setValue(0); setProgress(1); }
            return;
        }

        const start = performance.now();
        const step = (now) => {
            const p = Math.min((now - start) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(eased * target));
            setProgress(p);
            if (p < 1) {
                frameRef.current = requestAnimationFrame(step);
            }
        };

        frameRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target, duration, shouldStart]);

    // vertical blur that fades out as count finishes
    const blur = progress < 1 ? (1 - progress) * 2 : 0;

    return { value, blur };
};

export default useCountUp;

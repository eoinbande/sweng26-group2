import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabase_client';
import '../styles/Garden.css';

/**
 * Pick an emoji to display for a plant card in the garden.
 * Alive plants scale with duration (matches spec: 5-25→small, 25-60→medium, 60-120→tree).
 * Dead plants always show 💀.
 */
const getPlantEmoji = (plant) => {
    if (plant.status === 'dead') return '💀';
    if (plant.duration <= 25) return '🌱';
    if (plant.duration <= 60) return '🌿';
    return '🌳';
};

const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const Garden = () => {
    const navigate = useNavigate();
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const { data: authData } = await supabase.auth.getUser();
                const userId = authData?.user?.id;
                if (!userId) {
                    setLoading(false);
                    return;
                }

                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/focus/plants/${userId}`,
                    { cache: 'no-store' }
                );
                const data = await res.json();
                setPlants(data.plants || []);
            } catch (e) {
                console.error('Failed to fetch garden plants:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchPlants();
    }, []);

    const alivePlants = plants.filter(p => p.status === 'alive');
    const deadPlants = plants.filter(p => p.status === 'dead');

    return (
        <div className="garden-page">
            <div className="garden-container">

                {/* Header */}
                <div className="garden-header">
                    <button
                        className="garden-back-btn"
                        onClick={() => navigate('/home')}
                        aria-label="Back to home"
                    >
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <h1 className="garden-title">My Garden</h1>
                </div>

                {loading ? (
                    <div className="garden-loading">Loading your garden…</div>
                ) : plants.length === 0 ? (
                    <div className="garden-empty">
                        <p className="garden-empty-emoji">🌱</p>
                        <p className="garden-empty-text">No plants yet</p>
                        <p className="garden-empty-sub">
                            Complete a focus session on any goal to grow your first plant!
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="garden-count">
                            {alivePlants.length} plant{alivePlants.length !== 1 ? 's' : ''} grown
                            {deadPlants.length > 0 && (
                                <span className="garden-dead-count"> · {deadPlants.length} wilted</span>
                            )}
                        </p>

                        <div className="garden-grid">
                            {plants.map(plant => (
                                <div
                                    key={plant.id}
                                    className={`garden-plant-card${plant.status === 'dead' ? ' dead' : ''}`}
                                >
                                    {plant.deep_focus && (
                                        <span className="garden-deep-badge" title="Deep Focus">🔒</span>
                                    )}
                                    <span className="garden-plant-emoji">
                                        {getPlantEmoji(plant)}
                                    </span>
                                    <span className="garden-plant-goal" title={plant.goal_title}>
                                        {plant.goal_title || 'Goal'}
                                    </span>
                                    <span className="garden-plant-duration">{plant.duration}m</span>
                                    <span className="garden-plant-date">
                                        {formatDate(plant.created_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default Garden;

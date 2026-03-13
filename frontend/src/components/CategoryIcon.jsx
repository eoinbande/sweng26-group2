import React, { useState, useRef, useEffect } from "react"
import '../styles/components/CategoryIcon.css'

const CategoryIcon = ({
    categories,
    selectedCategories,
    onSelectionChange,
    onNewCategory
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCatInput, setNewCatInput] = useState('');
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (isAddingNew && inputRef.current) inputRef.current.focus();
    }, [isAddingNew]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target))
                setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddCategory = () => {
        const trimmed = newCatInput.trim();
        if (trimmed && !categories.includes(trimmed)) onNewCategory(trimmed);
        setNewCatInput('');
        setIsAddingNew(false);
    };

    return (
        <div className="category-bar" ref={containerRef}>
            <div className="category-bar-row">
                <button
                    className="category-btn"
                    onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsAddingNew(false); }}
                >
                    Category {isDropdownOpen ? '▲' : '▼'}
                </button>
                <button
                    className="new-category-btn"
                    onClick={() => { setIsAddingNew(true); setIsDropdownOpen(false); }}
                >
                    + New category
                </button>

                {isDropdownOpen && (
                    <div className="category-dropdown">
                        <p className="dropdown-item"
                            onClick={() => { onSelectionChange([]); setIsDropdownOpen(false); }}>
                            {selectedCategories.length === 0
                                ? <span className="checkmark">✓</span>
                                : <span className="checkmark-placeholder" />}
                            All
                        </p>
                        {categories.map(cat => (
                            <React.Fragment key={cat}>
                                <div className="dropdown-divider" />
                                <p className="dropdown-item"
                                    onClick={() => {
                                        const updated = selectedCategories.includes(cat)
                                            ? selectedCategories.filter(c => c !== cat)
                                            : [...selectedCategories, cat];
                                        onSelectionChange(updated);
                                    }}>
                                    {selectedCategories.includes(cat)
                                        ? <span className="checkmark">✓</span>
                                        : <span className="checkmark-placeholder" />}
                                    {cat}
                                </p>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            {isAddingNew && (
                <div className="new-category-input-row">
                    <input
                        ref={inputRef}
                        className="new-category-field"
                        type="text"
                        placeholder="Category name..."
                        value={newCatInput}
                        onChange={e => setNewCatInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleAddCategory();
                            if (e.key === 'Escape') { setIsAddingNew(false); setNewCatInput(''); }
                        }}
                    />
                    <button className="new-category-add-btn" onClick={handleAddCategory}>Add</button>
                    <button className="new-category-cancel-btn"
                        onClick={() => { setIsAddingNew(false); setNewCatInput(''); }}>×</button>
                </div>
            )}
        </div>
    );
};

export default CategoryIcon;

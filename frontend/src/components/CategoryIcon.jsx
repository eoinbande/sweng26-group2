import React, { useState, useRef, useEffect } from "react"
import '../styles/components/CategoryIcon.css'

const CategoryIcon = ({
    categories,
    selectedCategories,
    onSelectionChange,
    onNewCategory
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownClosing, setDropdownClosing] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [inputClosing, setInputClosing] = useState(false);
    const [newCatInput, setNewCatInput] = useState('');
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (isAddingNew && inputRef.current) inputRef.current.focus();
    }, [isAddingNew]);

    const closeDropdown = () => {
        setDropdownClosing(true);
        setTimeout(() => { setIsDropdownOpen(false); setDropdownClosing(false); }, 200);
    };

    const closeInput = () => {
        setInputClosing(true);
        setTimeout(() => { setIsAddingNew(false); setInputClosing(false); setNewCatInput(''); }, 200);
    };

    // close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                if (isDropdownOpen && !dropdownClosing) closeDropdown();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen, dropdownClosing]);

    const handleAddCategory = () => {
        const trimmed = newCatInput.trim();
        if (trimmed && !categories.includes(trimmed)) onNewCategory(trimmed);
        closeInput();
    };

    return (
        <div className="category-bar" ref={containerRef}>
            <div className="category-bar-row">
                <button
                    className="category-btn"
                    onClick={() => {
                        if (isDropdownOpen) { closeDropdown(); }
                        else { setIsDropdownOpen(true); if (isAddingNew) closeInput(); }
                    }}
                >
                    Category {isDropdownOpen ? '▲' : '▼'}
                </button>
                <button
                    className="new-category-btn"
                    onClick={() => { setIsAddingNew(true); if (isDropdownOpen) closeDropdown(); }}
                >
                    + New category
                </button>

                {isDropdownOpen && (
                    <div className={`category-dropdown${dropdownClosing ? ' closing' : ''}`}>
                        <p className="dropdown-item"
                            onClick={() => { onSelectionChange([]); closeDropdown(); }}>
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
                <div className={`new-category-input-row${inputClosing ? ' closing' : ''}`}>
                    <input
                        ref={inputRef}
                        className="new-category-field"
                        type="text"
                        placeholder="Category name..."
                        value={newCatInput}
                        onChange={e => setNewCatInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleAddCategory();
                            if (e.key === 'Escape') closeInput();
                        }}
                    />
                    <button className="new-category-add-btn" onClick={handleAddCategory}>Add</button>
                    <button className="new-category-cancel-btn"
                        onClick={closeInput}>×</button>
                </div>
            )}
        </div>
    );
};

export default CategoryIcon;

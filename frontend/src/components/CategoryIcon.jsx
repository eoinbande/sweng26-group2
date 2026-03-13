import React, {useState, useRef, useEffect} from "react"
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
    return <div className = "category-bar" ref={containerRef}> 
        <div className="category-bar-row"> 
            <button className="category-btn" onClick={() => setIsDropdownOpen (!isDropdownOpen)}>
                 Category {isDropdownOpen ? '▲' : '▼'}
            </button>
            { isDropdownOpen && <div className="category-dropdown"> 
                <p onClick={() => { onSelectionChange([]); setIsDropdownOpen(false); }}>
                    {selectedCategories.length === 0 ? '✓ ' : ''}All
                    </p>
                    {categories.map(cat => (
                        <p key={cat} onClick={() => {
                            const updated = selectedCategories.includes(cat)
                                ? selectedCategories.filter(c => c !== cat)
                                : [...selectedCategories, cat];
                            onSelectionChange(updated);
                        }}>
                            {selectedCategories.includes(cat) ? '✓ ' : ''}{cat}
                        </p>
                    ))}
                </div>
            }
        </div>

    </div>
};
export default CategoryIcon;
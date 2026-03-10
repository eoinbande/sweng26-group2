import React, {useState} from "react"
import '../styles/components/CategoryIcon.css'
const CategoryIcon = ({
    categories,
    selectedCategories,
    onSelectionChange,
    onNewCategory
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    return <div className = "category-bar">
        <div> 
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
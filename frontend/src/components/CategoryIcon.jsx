import React, {useState} from "react"
import '../styles/components/CategoryIcon.css'
const CategoryIcon = ({
    categories,
    selectedCategories,
    onSelectionChange,
    onNewCategory
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');
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

        <div>
            { isAddingNew 
            ? <div className = "new-category-input"> 
                <input 
                value = {newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.currentTarget.value)}
                placeholder="Category name"/>
                
                <button onClick={() => { 
                    onNewCategory(newCategoryInput);
                    setNewCategoryInput('');
                    setIsAddingNew(false);
                }}> Add</button> 
                </div>:
                 <button className= "new-category-btn" onClick = {() => setIsAddingNew(true)}> + New category</button>}
        </div>

    </div>
};
export default CategoryIcon;
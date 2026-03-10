import React, {useState} from "react"

const CategoryIcon = ({
    categories,
    selectedCategories,
    onSelectionChange,
    onNewCategory
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');
    return <div className = "category">
        <div> 
            <button onClick={() => setIsDropdownOpen (!isDropdownOpen)}>
                 Category {isDropdownOpen ? '▲' : '▼'}
            </button>
            { isDropdownOpen && <div> </div>}
        </div>

        <div>
            { isAddingNew 
            ? <div> 
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
                 <button onClick = {() => setIsAddingNew(true)}> + New category</button>}
        </div>

    </div>
};
export default CategoryIcon;
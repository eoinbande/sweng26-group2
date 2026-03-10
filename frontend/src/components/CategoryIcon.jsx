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
        <h4> Category </h4>
        <div> 
            <button> Category ▼ </button>
            { isDropdownOpen && <div> </div>}
        </div>

        <div>
            { isAddingNew ? <input + confirm> : <button> + New category</button>}
        </div>

    </div>
};
export default CategoryIcon;
import React, {useState} from "react"

const CategoryIcon = ({
    categories,
    selectedCategories,
    onSelectionChange,
    onNewCategory
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCategoryInput, setCategoryInput] = useState('');

    return <div></div>
};
export default CategoryIcon;
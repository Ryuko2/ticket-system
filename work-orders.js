// Work Orders Management System
const workOrderCategories = {
    'plumbing': ['Leak repair', 'Drain cleaning', 'Pipe replacement', 'Fixture installation', 'Water heater repair'],
    'electrical': ['Outlet/switch repair', 'Light fixture replacement', 'Panel upgrade', 'Emergency repair', 'Wiring issues'],
    'hvac': ['AC repair', 'Heating repair', 'Filter replacement', 'System maintenance', 'Thermostat replacement'],
    'carpentry': ['Door repair', 'Cabinet repair', 'Trim work', 'Deck/fence repair', 'Custom woodwork'],
    'painting': ['Interior painting', 'Exterior painting', 'Touch-up work', 'Pressure washing', 'Surface preparation'],
    'general': ['Appliance repair', 'Lock replacement', 'General repairs', 'Pool maintenance', 'Landscaping'],
    'emergency': ['Fire damage', 'Water damage', 'Storm damage', 'Security issues', 'Other emergencies']
};

document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('workOrderCategory');
    const taskSelect = document.getElementById('workOrderTask');
    
    if (categorySelect) {
        Object.keys(workOrderCategories).forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categorySelect.appendChild(option);
        });
        
        categorySelect.addEventListener('change', () => {
            const category = categorySelect.value;
            taskSelect.innerHTML = '<option value="">Select Task</option>';
            taskSelect.disabled = !category;
            
            if (category && workOrderCategories[category]) {
                workOrderCategories[category].forEach(task => {
                    const option = document.createElement('option');
                    option.value = task;
                    option.textContent = task;
                    taskSelect.appendChild(option);
                });
            }
        });
    }
});

console.log('✅ Work orders system loaded');

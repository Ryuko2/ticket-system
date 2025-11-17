// Violations Management System
const violationCategories = {
    'parking': [
        'Unauthorized vehicle in reserved spot',
        'Parking in fire lane',
        'Expired vehicle registration',
        'Commercial vehicle in residential area',
        'Blocking driveway or walkway',
        'Oversized vehicle violation'
    ],
    'noise': [
        'Loud music after quiet hours (10 PM - 8 AM)',
        'Construction noise during restricted hours',
        'Excessive pet noise',
        'Party disturbance'
    ],
    'property': [
        'Trash left outside designated areas',
        'Unsightly exterior modifications',
        'Balcony storage violations',
        'Unapproved modifications',
        'Pool furniture in common areas'
    ],
    'pets': [
        'Unleashed pet in common areas',
        'Pet waste not cleaned',
        'Unauthorized pet size/breed',
        'Excessive barking/noise'
    ],
    'common': [
        'Unauthorized use of amenities',
        'Pool rules violation',
        'Gym equipment misuse',
        'Smoking in prohibited areas'
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('violationCategory');
    const ruleSelect = document.getElementById('violationRule');
    
    if (categorySelect) {
        Object.keys(violationCategories).forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categorySelect.appendChild(option);
        });
        
        categorySelect.addEventListener('change', () => {
            const category = categorySelect.value;
            ruleSelect.innerHTML = '<option value="">Select Rule</option>';
            ruleSelect.disabled = !category;
            
            if (category && violationCategories[category]) {
                violationCategories[category].forEach(rule => {
                    const option = document.createElement('option');
                    option.value = rule;
                    option.textContent = rule;
                    ruleSelect.appendChild(option);
                });
            }
        });
    }
});

console.log('✅ Violations system loaded');

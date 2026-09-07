// DOM Element Selectors
const commitBtn = document.getElementById('commitBtn');
const viewBtn = document.getElementById('viewBtn');
const clearBtn = document.getElementById('clearBtn');
const userForm = document.getElementById('userForm');
const errorSummary = document.getElementById('errorSummary');
const tableContainer = document.getElementById('tableContainer');

// Register Event Listeners
commitBtn.addEventListener('click', handleCommit);
viewBtn.addEventListener('click', handleViewEntries);
clearBtn.addEventListener('click', handleClearData);

/**
 * Handles form validation, data persistence, and JSON simulation/download logic.
 */
function handleCommit() {
    // Reset previous error layouts
    errorSummary.style.display = 'none';
    errorSummary.innerHTML = '';

    const emptyCheckFields = document.querySelectorAll('.validate-empty');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    
    let errorMessages = [];

    // 1. Check that all marked text fields and textareas are non-empty
    emptyCheckFields.forEach(field => {
        if (field.value.trim() === '') {
            // Find corresponding label text dynamically to build clean error messages
            const labelText = field.previousElementSibling.innerText;
            errorMessages.push(`The field "${labelText}" cannot be empty.`);
        }
    });

    // 2. Check if email format is structurally valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField.value.trim() !== '' && !emailRegex.test(emailField.value.trim())) {
        errorMessages.push('Please enter a valid format for the email address.');
    }

    // 3. Check if phone number is a strict 10-digit numerical sequence
    const phoneRegex = /^\d{10}$/;
    if (phoneField.value.trim() !== '' && !phoneRegex.test(phoneField.value.trim())) {
        errorMessages.push('Phone number must consist of exactly 10 digits.');
    }

    // Stop execution and render warnings if any checks fail
    if (errorMessages.length > 0) {
        errorSummary.innerHTML = errorMessages.join('<br>');
        errorSummary.style.display = 'block';
        return;
    }

    // Construct the structured data row object
    const newEntry = {
        fullName: document.getElementById('fullName').value.trim(),
        email: emailField.value.trim(),
        phone: phoneField.value.trim(),
        comments: document.getElementById('comments').value.trim(),
        timestamp: new Date().toISOString()
    };

    // Pull down existing entries matrix or instantiate an empty base (simulating JSON file storage)
    let dynamicJsonFile = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];
    
    // Append the newly submitted row
    dynamicJsonFile.push(newEntry);

    // Write back down to browser client memory
    localStorage.setItem('simulatedJsonFile', JSON.stringify(dynamicJsonFile));

    // Trigger a browser-driven physical JSON download to your computer
    triggerJsonDownload(dynamicJsonFile);

    alert('Data processed and appended successfully!');
    userForm.reset();
}

/**
 * Builds a data table dynamically via standard DOM manipulation patterns.
 */
function handleViewEntries() {
    // Clear out whatever structure was inside the container previously
    tableContainer.innerHTML = '';

    // Fetch the JSON dataset from storage
    const dynamicJsonFile = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];

    if (dynamicJsonFile.length === 0) {
        tableContainer.innerText = 'No entries currently reside in the data layer.';
        return;
    }

    // Instantiate table element scaffolding
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Header Setup
    const columnTitles = ['Full Name', 'Email Address', 'Phone Number', 'Comments'];
    const trHeader = document.createElement('tr');
    
    columnTitles.forEach(titleText => {
        const th = document.createElement('th');
        th.innerText = titleText;
        trHeader.appendChild(th);
    });
    thead.appendChild(trHeader);
    table.appendChild(thead);

    // Row Insertion Loop
    dynamicJsonFile.forEach(rowItem => {
        const trRow = document.createElement('tr');

        // Map matching keys to individual text node fields explicitly to avoid rendering quirks
        const dataKeys = ['fullName', 'email', 'phone', 'comments'];
        dataKeys.forEach(key => {
            const td = document.createElement('td');
            td.innerText = rowItem[key];
            trRow.appendChild(td);
        });

        tbody.appendChild(trRow);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

/**
 * Utility function to wipe all stored entries and clear active DOM table views.
 */
function handleClearData() {
    if (confirm('Are you sure you want to permanently delete all submitted entries?')) {
        // Remove item from localStorage simulation layer
        localStorage.removeItem('simulatedJsonFile');
        
        // Clear active DOM layout components 
        tableContainer.innerHTML = '';
        errorSummary.style.display = 'none';
        errorSummary.innerHTML = '';
        userForm.reset();
        
        alert('All entries have been cleared successfully.');
    }
}

/**
 * Generates an on-the-fly downloadable JSON text file copy for the user.
 */
function triggerJsonDownload(jsonData) {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const downloadAnchor = document.createElement('a');
    
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = 'form_entries.json';
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

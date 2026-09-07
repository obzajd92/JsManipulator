// DOM Element Selectors
const commitBtn = document.getElementById('commitBtn');
const viewBtn = document.getElementById('viewBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const userForm = document.getElementById('userForm');
const errorSummary = document.getElementById('errorSummary');
const tableContainer = document.getElementById('tableContainer');
const editIndexField = document.getElementById('editIndex');

// Register Event Listeners
commitBtn.addEventListener('click', handleCommit);
viewBtn.addEventListener('click', handleViewEntries);
downloadBtn.addEventListener('click', handleManualDownload);
clearBtn.addEventListener('click', handleClearData);

/**
 * Handles validation and saves or updates dataset items.
 */
function handleCommit() {
    errorSummary.style.display = 'none';
    errorSummary.innerHTML = '';

    const emptyCheckFields = document.querySelectorAll('.validate-empty');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    
    let errorMessages = [];

    // 1. Text and Textarea structural emptiness screening
    emptyCheckFields.forEach(field => {
        if (field.value.trim() === '') {
            const labelText = field.previousElementSibling.innerText;
            errorMessages.push(`The field "${labelText}" cannot be empty.`);
        }
    });

    // 2. Email structural layout analysis
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField.value.trim() !== '' && !emailRegex.test(emailField.value.trim())) {
        errorMessages.push('Please enter a valid format for the email address.');
    }

    // 3. Exact 10-digit number sequence testing
    const phoneRegex = /^\d{10}$/;
    if (phoneField.value.trim() !== '' && !phoneRegex.test(phoneField.value.trim())) {
        errorMessages.push('Phone number must consist of exactly 10 digits.');
    }

    if (errorMessages.length > 0) {
        errorSummary.innerHTML = errorMessages.join('<br>');
        errorSummary.style.display = 'block';
        return;
    }

    const currentEditIndex = parseInt(editIndexField.value, 10);
    const entryData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: emailField.value.trim(),
        phone: phoneField.value.trim(),
        comments: document.getElementById('comments').value.trim()
    };

    let dataset = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];

    if (currentEditIndex > -1) {
        // Update existing item row
        dataset[currentEditIndex] = entryData;
        alert('Entry updated successfully!');
        commitBtn.innerText = 'Commit'; // Revert button text back to baseline
        editIndexField.value = '-1';
    } else {
        // Append brand new registry row item
        dataset.push(entryData);
        alert('Data processed and appended successfully!');
    }

    localStorage.setItem('simulatedJsonFile', JSON.stringify(dataset));
    userForm.reset();

    // Dynamically refresh the data layout viewport if a table structure is visible
    if (tableContainer.innerHTML !== '') {
        handleViewEntries();
    }
}

/**
 * Builds data table representations complete with inline Action rows.
 */
function handleViewEntries() {
    tableContainer.innerHTML = '';
    const dataset = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];

    if (dataset.length === 0) {
        tableContainer.innerText = 'No entries currently reside in the data layer.';
        return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Header instantiation including Action column label
    const columnTitles = ['Full Name', 'Email Address', 'Phone Number', 'Comments', 'Actions'];
    const trHeader = document.createElement('tr');
    
    columnTitles.forEach(titleText => {
        const th = document.createElement('th');
        th.innerText = titleText;
        trHeader.appendChild(th);
    });
    thead.appendChild(trHeader);
    table.appendChild(thead);

    // Row rendering iteration loop pass
    dataset.forEach((rowItem, index) => {
        const trRow = document.createElement('tr');

        // Dynamic text node cell data creation tracking key references
        const dataKeys = ['fullName', 'email', 'phone', 'comments'];
        dataKeys.forEach(key => {
            const td = document.createElement('td');
            td.innerText = rowItem[key];
            trRow.appendChild(td);
        });

        // Instantiate control action configuration element options column wrapper
        const actionTd = document.createElement('td');

        // Edit control item button configuration
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'action-btn edit-btn';
        editBtn.innerText = 'Edit';
        editBtn.addEventListener('click', () => loadEntryForEdit(index));
        actionTd.appendChild(editBtn);

        // Delete control item button configuration
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerText = 'Delete';
        deleteBtn.addEventListener('click', () => deleteEntry(index));
        actionTd.appendChild(deleteBtn);

        trRow.appendChild(actionTd);
        tbody.appendChild(trRow);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

/**
 * Pulls a targeted structural entity item from persistent state data out into active inputs.
 */
function loadEntryForEdit(index) {
    const dataset = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];
    const item = dataset[index];

    if (!item) return;

    // Populate active workspace values
    document.getElementById('fullName').value = item.fullName;
    document.getElementById('email').value = item.email;
    document.getElementById('phone').value = item.phone;
    document.getElementById('comments').value = item.comments;

    // Modify active tracking indexes updates
    editIndexField.value = index;
    commitBtn.innerText = 'Update Entry';
    
    // Smooth scroll workspace layout up into form container focus
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Strips out an array position completely via matching numerical index mapping passes.
 */
function deleteEntry(index) {
    if (confirm('Are you sure you want to delete this specific row entry?')) {
        let dataset = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];
        dataset.splice(index, 1);
        localStorage.setItem('simulatedJsonFile', JSON.stringify(dataset));
        handleViewEntries(); // Redraw fresh window frame structures immediately
    }
}

/**
 * Dedicated button workflow tracking triggers for pulling offline copies manually.
 */
function handleManualDownload() {
    const dataset = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];

    if (dataset.length === 0) {
        alert('The JSON dataset layer is completely empty. There is nothing to export.');
        return;
    }

    const jsonString = JSON.stringify(dataset, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const downloadAnchor = document.createElement('a');
    
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = 'form_entries.json';
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

/**
 * Resets local historical records pools completely.
 */
function handleClearData() {
    if (confirm('Are you sure you want to permanently delete all submitted entries?')) {
        localStorage.removeItem('simulatedJsonFile');
        tableContainer.innerHTML = '';
        errorSummary.style.display = 'none';
        errorSummary.innerHTML = '';
        editIndexField.value = '-1';
        commitBtn.innerText = 'Commit';
        userForm.reset();
        alert('All entries have been cleared successfully.');
    }
}

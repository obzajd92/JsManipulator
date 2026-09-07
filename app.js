const commitBtn = document.getElementById('commitBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const userForm = document.getElementById('userForm');
const errorSummary = document.getElementById('errorSummary');

commitBtn.addEventListener('click', handleCommit);
downloadBtn.addEventListener('click', handleManualDownload);
clearBtn.addEventListener('click', handleClearData);

function handleCommit() {
    errorSummary.style.display = 'none';
    errorSummary.innerHTML = '';

    const emptyCheckFields = document.querySelectorAll('.validate-empty');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    let errorMessages = [];

    emptyCheckFields.forEach(field => {
        if (field.value.trim() === '') {
            const labelText = field.previousElementSibling.innerText;
            errorMessages.push(`The field "${labelText}" cannot be empty.`);
        }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField.value.trim() !== '' && !emailRegex.test(emailField.value.trim())) {
        errorMessages.push('Please enter a valid format for the email address.');
    }

    const phoneRegex = /^\d{10}$/;
    if (phoneField.value.trim() !== '' && !phoneRegex.test(phoneField.value.trim())) {
        errorMessages.push('Phone number must consist of exactly 10 digits.');
    }

    if (errorMessages.length > 0) {
        errorSummary.innerHTML = errorMessages.join('<br>');
        errorSummary.style.display = 'block';
        return;
    }

    const entryData = {
        id: Date.now().toString(), // Add unique string id identifier for explicit filtering updates
        fullName: document.getElementById('fullName').value.trim(),
        email: emailField.value.trim(),
        phone: phoneField.value.trim(),
        comments: document.getElementById('comments').value.trim()
    };

    let dataset = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];
    dataset.push(entryData);
    localStorage.setItem('simulatedJsonFile', JSON.stringify(dataset));

    alert('Data processed and appended successfully!');
    userForm.reset();
}

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

function handleClearData() {
    if (confirm('Are you sure you want to permanently delete all submitted entries?')) {
        localStorage.removeItem('simulatedJsonFile');
        userForm.reset();
        alert('All entries have been cleared successfully.');
    }
}

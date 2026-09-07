const tableContainer = document.getElementById('tableContainer');
const searchInput = document.getElementById('searchInput');
const sqlDisplay = document.getElementById('sqlDisplay');
const paginationControls = document.getElementById('paginationControls');

// Active State Configuration Management Variables
let currentPage = 1;
const itemsPerPage = 5;
let currentSortColumn = ''; 
let isSortAscending = true; 

// Bind query change listener events
searchInput.addEventListener('input', () => {
    currentPage = 1; // Reset to page 1 on active search filters changes
    renderFilteredEntries();
});

window.addEventListener('DOMContentLoaded', renderFilteredEntries);

function renderFilteredEntries() {
    tableContainer.innerHTML = '';
    paginationControls.innerHTML = '';
    
    let dataset = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];
    const queryTerm = searchInput.value.trim().toLowerCase();

    if (dataset.length === 0) {
        tableContainer.innerText = 'No records discovered inside the database.';
        sqlDisplay.innerText = 'SELECT * FROM form_entries; -- (No records inside data pool)';
        return;
    }

    // 1. Run Live Search Substring Filter Evaluation Pass
    let filteredResults = dataset.filter(item => {
        return item.fullName.toLowerCase().includes(queryTerm) ||
               item.email.toLowerCase().includes(queryTerm) ||
               item.phone.includes(queryTerm);
    });

    // 2. Process Sorting Rules Execution Strategy Changes
    if (currentSortColumn) {
        filteredResults.sort((a, b) => {
            let valueA = a[currentSortColumn].toLowerCase();
            let valueB = b[currentSortColumn].toLowerCase();
            if (valueA < valueB) return isSortAscending ? -1 : 1;
            if (valueA > valueB) return isSortAscending ? 1 : -1;
            return 0;
        });
    }

    // 3. Generate Transpiled Pseudo-SQL Command Mirror Layer
    let sqlStatement = 'SELECT * FROM form_entries';
    const conditions = [];
    if (queryTerm !== '') {
        const safeQuery = queryTerm.replace(/'/g, "''");
        conditions.push(`(LOWER(fullName) LIKE '%${safeQuery}%' OR LOWER(email) LIKE '%${safeQuery}%' OR phone LIKE '%${safeQuery}%')`);
    }
    if (conditions.length > 0) {
        sqlStatement += `\nWHERE ${conditions.join(' AND ')}`;
    }
    if (currentSortColumn) {
        sqlStatement += `\nORDER BY ${currentSortColumn} ${isSortAscending ? 'ASC' : 'DESC'}`;
    }
    // Reflect structural page constraints in Pseudo-SQL output via standard OFFSET pagination syntax
    sqlStatement += `\nLIMIT ${itemsPerPage} OFFSET ${(currentPage - 1) * itemsPerPage};`;
    sqlDisplay.innerText = sqlStatement;

    if (filteredResults.length === 0) {
        tableContainer.innerText = 'No records matched your search parameters.';
        return;
    }

    // 4. Extract Segment Boundaries for Paginated View Grid Array Window
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredResults.slice(startIndex, startIndex + itemsPerPage);

    // 5. Build Grid Layout Structures using DOM Manipulation
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headersConfig = [
        { label: 'Full Name', key: 'fullName' },
        { label: 'Email Address', key: 'email' },
        { label: 'Phone Number', key: 'phone' },
        { label: 'Comments', key: 'comments' }
    ];

    const trHeader = document.createElement('tr');
    
    headersConfig.forEach(header => {
        const th = document.createElement('th');
        // Dynamic sorting state indicator updates
        let indicator = ' ↕';
        if (currentSortColumn === header.key) {
            indicator = isSortAscending ? ' ↑' : ' ↓';
        }
        th.innerText = header.label + indicator;
        th.addEventListener('click', () => toggleSortDirection(header.key));
        trHeader.appendChild(th);
    });

    // Append static Actions column header line configuration elements
    const thActions = document.createElement('th');
    thActions.innerText = 'Actions';
    trHeader.appendChild(thActions);
    
    thead.appendChild(trHeader);
    table.appendChild(thead);

    paginatedItems.forEach(rowItem => {
        const trRow = document.createElement('tr');
        headersConfig.forEach(header => {
            const td = document.createElement('td');
            td.innerText = rowItem[header.key];
            trRow.appendChild(td);
        });

        const actionTd = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerText = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTargetEntry(rowItem.id));
        actionTd.appendChild(deleteBtn);
        trRow.appendChild(actionTd);

        tbody.appendChild(trRow);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // 6. Append Navigational Button Layouts dynamically
    if (totalPages > 1) {
        buildPaginationControls(totalPages);
    }
}

function toggleSortDirection(columnKey) {
    if (currentSortColumn === columnKey) {
        isSortAscending = !isSortAscending;
    } else {
        currentSortColumn = columnKey;
        isSortAscending = true;
    }
    renderFilteredEntries();
}

function buildPaginationControls(totalPages) {
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.type = 'button';
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.innerText = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderFilteredEntries();
        });
        paginationControls.appendChild(pageBtn);
    }
}

function deleteTargetEntry(uniqueId) {
    if (confirm('Are you sure you want to delete this row entry?')) {
        let dataset = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];
        dataset = dataset.filter(item => item.id !== uniqueId);
        localStorage.setItem('simulatedJsonFile', JSON.stringify(dataset));
        renderFilteredEntries();
    }
}

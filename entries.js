const tableContainer = document.getElementById('tableContainer');
const searchInput = document.getElementById('searchInput');
const perPageSelect = document.getElementById('perPageSelect');
const paginationControls = document.getElementById('paginationControls');
const chartContainer = document.getElementById('chartContainer');
const sqlDisplay = document.getElementById('sqlDisplay');
const csvBtn = document.getElementById('csvBtn');

// Active State Tracker Settings
let currentPage = 1;
let itemsPerPage = parseInt(perPageSelect.value, 10);
let currentSortColumn = ''; 
let isSortAscending = true; 

// Event Listeners
searchInput.addEventListener('input', () => { currentPage = 1; renderFilteredEntries(); });
perPageSelect.addEventListener('change', () => {
    itemsPerPage = parseInt(perPageSelect.value, 10);
    currentPage = 1; 
    renderFilteredEntries();
});
csvBtn.addEventListener('click', handleExportCSV);

window.addEventListener('DOMContentLoaded', renderFilteredEntries);

function renderFilteredEntries() {
    tableContainer.innerHTML = '';
    paginationControls.innerHTML = '';
    
    let dataset = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];
    const queryTerm = searchInput.value.trim().toLowerCase();

    // Render the SVG bar chart using the full unfiltered core dataset
    renderDomainChart(dataset);

    if (dataset.length === 0) {
        tableContainer.innerText = 'No records discovered inside the database.';
        sqlDisplay.innerText = 'SELECT * FROM form_entries;';
        return;
    }

    // 1. Live Filter logic 
    let filteredResults = dataset.filter(item => {
        return item.fullName.toLowerCase().includes(queryTerm) ||
               item.email.toLowerCase().includes(queryTerm) ||
               item.phone.includes(queryTerm);
    });

    // 2. Sorting logic
    if (currentSortColumn) {
        filteredResults.sort((a, b) => {
            let valueA = a[currentSortColumn].toLowerCase();
            let valueB = b[currentSortColumn].toLowerCase();
            if (valueA < valueB) return isSortAscending ? -1 : 1;
            if (valueA > valueB) return isSortAscending ? 1 : -1;
            return 0;
        });
    }

    // 3. Generate Pseudo-SQL log string
    let sqlStatement = 'SELECT * FROM form_entries';
    if (queryTerm !== '') {
        const safeQuery = queryTerm.replace(/'/g, "''");
        sqlStatement += `\nWHERE (LOWER(fullName) LIKE '%${safeQuery}%' OR LOWER(email) LIKE '%${safeQuery}%' OR phone LIKE '%${safeQuery}%')`;
    }
    if (currentSortColumn) {
        sqlStatement += `\nORDER BY ${currentSortColumn} ${isSortAscending ? 'ASC' : 'DESC'}`;
    }
    sqlStatement += `\nLIMIT ${itemsPerPage} OFFSET ${(currentPage - 1) * itemsPerPage};`;
    sqlDisplay.innerText = sqlStatement;

    if (filteredResults.length === 0) {
        tableContainer.innerText = 'No records matched your search parameters.';
        return;
    }

    // 4. Extract data subset windows for active pagination boundaries
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredResults.slice(startIndex, startIndex + itemsPerPage);

    // 5. Build HTML table via DOM manipulation
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
        let indicator = ' ↕';
        if (currentSortColumn === header.key) {
            indicator = isSortAscending ? ' ↑' : ' ↓';
        }
        th.innerText = header.label + indicator;
        th.addEventListener('click', () => {
            if (currentSortColumn === header.key) {
                isSortAscending = !isSortAscending;
            } else {
                currentSortColumn = header.key;
                isSortAscending = true;
            }
            renderFilteredEntries();
        });
        trHeader.appendChild(th);
    });

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
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this row entry?')) {
                let currentData = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];
                currentData = currentData.filter(item => item.id !== rowItem.id);
                localStorage.setItem('simulatedJsonFile', JSON.stringify(currentData));
                renderFilteredEntries();
            }
        });
        actionTd.appendChild(deleteBtn);
        trRow.appendChild(actionTd);
        tbody.appendChild(trRow);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // Render page controls buttons array if multiple segments present
    if (totalPages > 1) {
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
}

/**
 * Parses current row values out into a valid downloadable CSV spreadsheet format file string block.
 */
function handleExportCSV() {
    const dataset = JSON.parse(localStorage.getItem('simulatedJsonFile')) || [];
    if (dataset.length === 0) {
        alert('There is no data available to export to CSV.');
        return;
    }

    const headers = ['Full Name', 'Email Address', 'Phone Number', 'Comments'];
    const csvRows = [headers.join(',')];

    dataset.forEach(item => {
        const values = [
            `"${item.fullName.replace(/"/g, '""')}"`,
            `"${item.email.replace(/"/g, '""')}"`,
            `"${item.phone.replace(/"/g, '""')}"`,
            `"${item.comments.replace(/"/g, '""')}"`
        ];
        csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = 'form_entries.csv';
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

/**
 * Builds an on-the-fly interactive bar chart graph visualization entirely via pure SVG DOM elements.
 */
function renderDomainChart(data) {
    chartContainer.innerHTML = '';
    if (data.length === 0) {
        chartContainer.innerText = 'No domain entries data pool found to draw chart.';
        return;
    }

    // Extract email extensions (e.g. gmail.com)
    const domainCounts = {};
    data.forEach(item => {
        const parts = item.email.split('@');
        if (parts.length === 2) {
            const domain = parts[1].toLowerCase();
            domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        }
    });

    const entries = Object.entries(domainCounts);
    const maxCount = Math.max(...entries.map(e => e[1]), 1);

    // Setup basic dimensions variables for SVG canvas box building 
    const svgWidth = 500;
    const barHeight = 35;
    const padding = 15;
    const svgHeight = entries.length * (barHeight + padding) + 20;

    const svgNamespace = "http://w3.org";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", svgHeight);
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    entries.forEach(([domain, count], index) => {
        const yPosition = index * (barHeight + padding) + 10;
        
        // Compute structural percentage length limits dynamically
        const maxBarWidth = 300;
        const computedBarWidth = (count / maxCount) * maxBarWidth;

        // 1. Append labels string texts
        const textLabel = document.createElementNS(svgNamespace, "text");
        textLabel.setAttribute("x", "10");
        textLabel.setAttribute("y", yPosition + 22);
        textLabel.setAttribute("fill", "#8be9fd"); // Dracula Cyan
        textLabel.style.fontFamily = "sans-serif";
        textLabel.style.fontSize = "13px";
        textLabel.style.fontWeight = "bold";
        textLabel.textContent = domain.length > 15 ? domain.substring(0, 13) + '..' : domain;
        svg.appendChild(textLabel);

        // 2. Append graphic bar rect variables shapes templates
        const rect = document.createElementNS(svgNamespace, "rect");
        rect.setAttribute("x", "130");
        rect.setAttribute("y", yPosition);
        rect.setAttribute("width", computedBarWidth || 5);
        rect.setAttribute("height", barHeight);
rect.setAttribute("fill", "#ff79c6"); // Dracula Pinkrect.setAttribute("rx", "4");svg.appendChild(rect);// 3. Append quantity metrics valuesconst textCount = document.createElementNS(svgNamespace, "text");textCount.setAttribute("x", 135 + computedBarWidth + 8);textCount.setAttribute("y", yPosition + 22);textCount.setAttribute("fill", "#50fa7b"); // Dracula GreentextCount.style.fontFamily = "sans-serif";textCount.style.fontSize = "12px";textCount.style.fontWeight = "bold";textCount.textContent = (${count});svg.appendChild(textCount);});chartContainer.appendChild(svg);}

"use strict";

//never change
let contestants = [];
let contestantNames = {};
let judges = [];
let categories = [];
let categoryNames = {};
let scoresData = {};
let dropOutliers = false;
let currentCarouselIndex = 0;


/**
 * Sets up the list of contestants based on user input.
 */
function setupContestants() {
    const numInput = document.getElementById('numContestants');

    if (!numInput) {
        alert('Error: numContestants element not found');
        return;
    }

    const num = parseInt(numInput.value);

    if (isNaN(num) || num < 1) {
        alert('Please enter a valid number of contestants (must be 1 or more)');
        return;
    }

    contestants = [];
    contestantNames = {};
    for (let i = 1; i <= num; i++) {
        contestants.push(i);
        contestantNames[i] = 'Contestant #' + i;
    }

    const display = document.getElementById('contestantListDisplay');
    if (display) {
        display.innerHTML = `Contestants created: ${num} contestants`;
    }

    localStorage.setItem('pageantContestants', JSON.stringify(contestants));
}

// Create category list
function setupCategories() {
    console.log('setupCategories called');
    const numInput = document.getElementById('numCategories');
    
    if (!numInput) {
        console.error('numCategories element not found!');
        alert('Error: numCategories element not found');
        return;
    }
    
    const num = parseInt(numInput.value);
    console.log('Number of categories entered:', num);

    if (isNaN(num) || num < 1) {
        alert('Please enter a valid number of categories (must be 1 or more)');
        return;
    }

    categories = [];
    categoryNames = {};
    for (let i = 1; i <= num; i++) {
        categories.push('category_' + i);
        categoryNames['category_' + i] = 'Category #' + i;
    }

    console.log('Categories array:', categories);

    const display = document.getElementById('categoryInputsDisplay');
    if (display) {
        let html = '<h4>Enter Category Names</h4>';
        html += '<div class="row">';

        for (let i = 0; i < categories.length; i++) {
            const catKey = categories[i];
            html += '<div class="col-md-6 mb-3">';
            html += '<label for="categoryName' + i + '" class="form-label">Category #' + (i + 1) + ' Name:</label>';
            html += '<input type="text" id="categoryName' + i + '" class="form-control" placeholder="Enter category name" value="' + categoryNames[catKey] + '">';
            html += '</div>';
        }

        html += '</div>';
        html += '<button class="btn btn-success mt-3" onclick="saveCategoryNames()">Save Category Names</button>';
        display.innerHTML = html;
    }

    localStorage.setItem('pageantCategories', JSON.stringify(categories));
    localStorage.setItem('pageantCategoryNames', JSON.stringify(categoryNames));
}

// Save the category names user typed
function saveCategoryNames() {
    for (let i = 0; i < categories.length; i++) {
        const catKey = categories[i];
        const nameInput = document.getElementById('categoryName' + i);
        const name = nameInput.value.trim();
        
        if (name) {
            categoryNames[catKey] = name;
        }
    }

    for (let i = 0; i < categories.length; i++) {
        scoresData[categories[i]] = [];
    }

    localStorage.setItem('pageantCategoryNames', JSON.stringify(categoryNames));

    alert('Category names saved!');
}

// Create judge list
function setupJudges() {
    console.log('setupJudges called');
    const numInput = document.getElementById('numJudges');
    
    if (!numInput) {
        console.error('numJudges element not found!');
        alert('Error: numJudges element not found');
        return;
    }
    
    const num = parseInt(numInput.value);
    console.log('Number of judges entered:', num);

    if (isNaN(num) || num < 1) {
        alert('Please enter a valid number of judges (must be 1 or more)');
        return;
    }

    judges = [];
    for (let i = 1; i <= num; i++) {
        judges.push(i);
    }

    console.log('Judges array:', judges);

    const display = document.getElementById('judgeListDisplay');
    if (display) {
        let html = '<p><strong>Judges created:</strong> ' + num + ' judges</p>';
        display.innerHTML = html;
        console.log('Judges display updated successfully');
    } else {
        console.error('judgeListDisplay element not found!');
    }

    generateScoreTables();

    localStorage.setItem('pageantJudges', JSON.stringify(judges));
    console.log('Judges saved to localStorage');
}

// Create the score input tables for each category
function generateScoreTables() {
    const scoreTableSection = document.getElementById('scoreTableSection');
    const scoreTableContainer = document.getElementById('scoreTableContainer');
    
    if (!scoreTableSection || !scoreTableContainer) {
        console.error('Score table section or container not found');
        return;
    }

    if (!contestants || contestants.length === 0) {
        alert('Please create contestants first');
        return;
    }

    if (!categories || categories.length === 0) {
        alert('Please create categories first');
        return;
    }

    if (!judges || judges.length === 0) {
        alert('Please create judges first');
        return;
    }

    let html = '';

    for (let cat = 0; cat < categories.length; cat++) {
        const category = categories[cat];
        const categoryName = categoryNames[category];

        html += '<div class="card mb-4">';
        html += '<div class="card-header bg-info text-white">';
        html += '<h4 class="mb-0">' + categoryName + '</h4>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<table class="table table-bordered">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Contestant #</th>';

        for (let j = 0; j < judges.length; j++) {
            html += '<th>Judge #' + judges[j] + '</th>';
        }

        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';

        for (let c = 0; c < contestants.length; c++) {
            const contestantNum = contestants[c];
            html += '<tr>';
            html += '<td><strong>Contestant #' + contestantNum + '</strong></td>';

            for (let j = 0; j < judges.length; j++) {
                const judgeNum = judges[j];
                const inputId = 'score_' + category + '_' + contestantNum + '_' + judgeNum;
                html += '<td>';
                html += '<input type="number" id="' + inputId + '" class="form-control" min="1" max="1000" value="">';
                html += '</td>';
            }

            html += '</tr>';
        }

        html += '</tbody>';
        html += '</table>';
        html += '<button class="btn btn-success mt-2" onclick="saveScoresForCategory(\'' + category + '\')">Save ' + categoryName + ' Scores</button>';
        html += '</div>';
        html += '</div>';
    }

    html += '<button class="btn btn-primary mt-3" onclick="calculateFinalScores()">Calculate Final Scores</button>';

    scoreTableContainer.innerHTML = html;
    scoreTableSection.style.display = 'block';
    populateScoreTables();
}

// Populate score tables with existing data
function populateScoreTables() {
    for (let cat = 0; cat < categories.length; cat++) {
        const category = categories[cat];
        
        for (let i = 0; i < scoresData[category].length; i++) {
            const scoreItem = scoresData[category][i];
            const inputId = 'score_' + category + '_' + scoreItem.contestantNumber + '_' + scoreItem.judgeNumber;
            const input = document.getElementById(inputId);
            
            if (input) {
                input.value = scoreItem.score;
            }
        }
    }
}

// Save all scores for one category
function saveScoresForCategory(category) {
    scoresData[category] = [];

    let savedCount = 0;

    for (let c = 0; c < contestants.length; c++) {
        const contestantNum = contestants[c];

        for (let j = 0; j < judges.length; j++) {
            const judgeNum = judges[j];
            const inputId = 'score_' + category + '_' + contestantNum + '_' + judgeNum;
            const input = document.getElementById(inputId);

            if (input && input.value) {
                const score = parseFloat(input.value);
                if (!isNaN(score) && score >= 1 && score <= 1000) {
                    scoresData[category].push({
                        contestantNumber: contestantNum,
                        judgeNumber: judgeNum,
                        score: score
                    });
                    savedCount++;
                }
            }
        }
    }

    alert('Saved ' + savedCount + ' scores for ' + categoryNames[category]);
    saveToStorage();
}

// Turn on/off outlier removal
function toggleOutliers() {
    dropOutliers = !dropOutliers;
    const toggle = document.getElementById('outlierToggle');
    if (toggle) {
        toggle.checked = dropOutliers;
    }
}

// Clear all data silently (helper function)
function clearAllDataSilent() {
    contestants = [];
    contestantNames = {};
    judges = [];
    categories = [];
    categoryNames = {};
    for (const key in scoresData) {
        delete scoresData[key];
    }
    dropOutliers = false;
    currentCarouselIndex = 0;
}

// Clear all data and reset the calculator
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        clearAllDataSilent();
        
        localStorage.removeItem('pageantContestants');
        localStorage.removeItem('pageantJudges');
        localStorage.removeItem('pageantCategories');
        localStorage.removeItem('pageantCategoryNames');
        localStorage.removeItem('pageantScores');
        
        document.getElementById('contestantListDisplay').innerHTML = '';
        document.getElementById('categoryInputsDisplay').innerHTML = '';
        document.getElementById('judgeListDisplay').innerHTML = '';
        document.getElementById('scoreTableSection').style.display = 'none';
        document.getElementById('scoreTableContainer').innerHTML = '';
        document.getElementById('finalScoresDisplay').innerHTML = '';
        
        document.getElementById('numContestants').value = '';
        document.getElementById('numCategories').value = '';
        document.getElementById('numJudges').value = '';
        
        alert('All data has been cleared!');
    }
}

// Load demo data from external JSON
// Replace the loadDemoData function in improved.js with this fixed version:

function loadDemoData() {
    if (confirm('This will replace all current data. Continue?')) {
        clearAllDataSilent();
        
        fetch('example.json')
            .then(response => response.json())
            .then(demoData => {
                // Load contestants
                contestants = [];
                contestantNames = {};
                for (let i = 0; i < demoData.contestants.length; i++) {
                    const c = demoData.contestants[i];
                    contestants.push(c.number);
                    contestantNames[c.number] = c.name;
                }
                
                // Load judges
                judges = demoData.judges.slice();
                
                // Load categories
                categories = [];
                categoryNames = {};
                for (let i = 0; i < demoData.categories.length; i++) {
                    const cat = demoData.categories[i];
                    categories.push(cat.id);
                    categoryNames[cat.id] = cat.name;
                }
                
                // Initialize score data structure
                for (let i = 0; i < categories.length; i++) {
                    scoresData[categories[i]] = [];
                }
                
                // Load scores - FIXED: properly group by category
                for (let i = 0; i < demoData.scores.length; i++) {
                    const scoreItem = demoData.scores[i];
                    
                    // Find the category ID that matches the category name
                    let categoryKey = null;
                    for (let j = 0; j < demoData.categories.length; j++) {
                        if (demoData.categories[j].name === scoreItem.category) {
                            categoryKey = demoData.categories[j].id;
                            break;
                        }
                    }
                    
                    if (categoryKey && scoresData[categoryKey]) {
                        scoresData[categoryKey].push({
                            contestantNumber: scoreItem.contestant,
                            judgeNumber: scoreItem.judge,
                            score: scoreItem.score
                        });
                    }
                }
                
                // Update contestant display
                const display = document.getElementById('contestantListDisplay');
                if (display) {
                    display.innerHTML = '<p><strong>Contestants loaded:</strong> ' + contestants.length + ' contestants</p>';
                }
                
                // Update judge display
                const judgeDisplay = document.getElementById('judgeListDisplay');
                if (judgeDisplay) {
                    judgeDisplay.innerHTML = '<p><strong>Judges loaded:</strong> ' + judges.length + ' judges</p>';
                }
                
                // Update category display
                const categoryDisplay = document.getElementById('categoryInputsDisplay');
                if (categoryDisplay) {
                    let html = '<h4>Categories Loaded</h4>';
                    html += '<ul>';
                    for (let i = 0; i < categories.length; i++) {
                        const catKey = categories[i];
                        html += '<li>' + categoryNames[catKey] + '</li>';
                    }
                    html += '</ul>';
                    categoryDisplay.innerHTML = html;
                }
                
                // Generate score tables and populate them
                generateScoreTables();
                
                // Save to storage
                saveToStorage();
                localStorage.setItem('pageantContestants', JSON.stringify(contestants));
                localStorage.setItem('pageantJudges', JSON.stringify(judges));
                localStorage.setItem('pageantCategories', JSON.stringify(categories));
                localStorage.setItem('pageantCategoryNames', JSON.stringify(categoryNames));
                
                alert('Demo data loaded successfully! Scroll down to see the scores and calculate results.');
            })
            .catch(error => {
                alert('Error loading demo data: ' + error.message);
                console.error(error);
            });
    }
}

// Export scores to CSV file
   function exportToCSV() {
    if (Object.keys(scoresData).length === 0) {
        alert('No scores to export. Please enter some scores first.');
        return;
    }

    // CSV Header: Contestant #, Category, Judge, Score
    let csv = 'Contestant #,Category,Judge,Score\n';

    // Sort by contestant, then category, then judge for readability
    for (let c = 0; c < contestants.length; c++) {
        const contestantNum = contestants[c];
        
        for (let cat = 0; cat < categories.length; cat++) {
            const category = categories[cat];
            const categoryName = categoryNames[category] || category;
            
            if (!scoresData[category]) continue;
            
            for (let s = 0; s < scoresData[category].length; s++) {
                const scoreObj = scoresData[category][s];
                
                if (scoreObj.contestantNumber === contestantNum) {
                    csv += contestantNum + ',' + categoryName + ',' + scoreObj.judgeNumber + ',' + scoreObj.score + '\n';
                }
            }
        }
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pageant-scores-' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    
    alert('Scores exported successfully!');
}
// Download blank score sheet with current setup
function downloadBlankScores() {
    if (!categories || categories.length === 0) {
        alert('Please set up categories first');
        return;
    }

    let csv = 'Contestant#';

    // Add judge headers
    for (let j = 0; j < judges.length; j++) {
        csv += ',Judge\'s Score #' + judges[j];
    }
    csv += '\n';

    // Add category name row for reference
    csv += 'Category: ';
    for (let c = 0; c < categories.length; c++) {
        if (c === 0) {
            csv += categoryNames[categories[c]];
        }
    }
    csv += '\n';

    // Add contestant rows
    for (let con = 0; con < contestants.length; con++) {
        const contestantNum = contestants[con];
        csv += 'Contestant#' + contestantNum;

        for (let j = 0; j < judges.length; j++) {
            csv += ',';
        }
        csv += '\n';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blank-scores-' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    
    alert('Blank score sheet downloaded! Fill it out in Excel/Sheets and upload it back.');
}

// Download filled scores from current category
function downloadFilledScores() {
    if (!categories || categories.length === 0) {
        alert('Please set up categories first');
        return;
    }

    const categoryKey = categories[0];
    const categoryScores = scoresData[categoryKey];

    if (categoryScores.length === 0) {
        alert('No scores entered yet. Please enter scores first.');
        return;
    }

    let csv = 'Contestant#';

    // Add judge headers
    for (let j = 0; j < judges.length; j++) {
        csv += ',Judge\'s Score #' + judges[j];
    }
    csv += '\n';

    // Add category name row for reference
    csv += 'Category: ' + categoryNames[categoryKey] + '\n';

    // Add contestant rows with scores
    for (let con = 0; con < contestants.length; con++) {
        const contestantNum = contestants[con];
        csv += 'Contestant#' + contestantNum;

        for (let j = 0; j < judges.length; j++) {
            const judgeNum = judges[j];
            
            // Find score for this contestant and judge
            let score = '';
            for (let s = 0; s < categoryScores.length; s++) {
                if (categoryScores[s].contestantNumber === contestantNum && 
                    categoryScores[s].judgeNumber === judgeNum) {
                    score = categoryScores[s].score;
                    break;
                }
            }
            
            csv += ',' + score;
        }
        csv += '\n';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filled-scores-' + categoryNames[categoryKey] + '-' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    
    alert('Filled score sheet downloaded! You can upload it back to restore these scores.');
}

// Import scores from CSV
function importFromCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const csv = event.target.result;
                const lines = csv.trim().split('\n');
                
                if (lines.length < 2) {
                    alert('CSV file is empty');
                    return;
                }
                
                const header = lines[0].split(',');
                const judgeCount = header.length - 1;
                
                // Check if this is the new spreadsheet format or old format
                const isSpreadsheetFormat = header[0].toLowerCase().includes('contestant') && 
                                           header[1] && header[1].toLowerCase().includes('judge');
                
                let importedCount = 0;
                
                if (isSpreadsheetFormat) {
                    // New spreadsheet format: Contestant#, Judge's Score #1, Judge's Score #2, etc
                    for (let i = 2; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;
                        
                        const parts = line.split(',');
                        if (parts.length < 2) continue;
                        
                        const contestantStr = parts[0].trim();
                        const contestantNum = parseInt(contestantStr.replace('Contestant#', ''));
                        
                        if (isNaN(contestantNum)) continue;
                        
                        // For spreadsheet format, we need to know which category this is for
                        // We'll store scores for each judge in order
                        for (let j = 1; j < parts.length; j++) {
                            const score = parseFloat(parts[j].trim());
                            
                            if (!isNaN(score) && score >= 1 && score <= 1000) {
                                const judgeNum = j;
                                
                                // Get first category key by default
                                const categoryKey = categories[0];
                                
                                if (!scoresData[categoryKey]) {
                                    scoresData[categoryKey] = [];
                                }
                                
                                scoresData[categoryKey].push({
                                    contestantNumber: contestantNum,
                                    judgeNumber: judgeNum,
                                    score: score
                                });
                                
                                importedCount++;
                            }
                        }
                    }
                    
                    alert('Imported ' + importedCount + ' scores successfully!\n\nNote: Scores were imported for the first category. If you have multiple categories, please import the file multiple times or enter scores manually for other categories.');
                } else {
                    // Old CSV format: Contestant,Judge,Category,Score
                    const headerLower = header[0].toLowerCase();
                    if (!headerLower.includes('contestant') || !headerLower.includes('judge') || !headerLower.includes('category') || !headerLower.includes('score')) {
                        alert('CSV format not recognized. Please use the format: Contestant,Judge,Category,Score');
                        return;
                    }
                    
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;
                        
                        const parts = line.split(',');
                        if (parts.length < 4) continue;
                        
                        const contestantNum = parseInt(parts[0].trim());
                        const judgeNum = parseInt(parts[1].trim());
                        const categoryName = parts[2].trim();
                        const score = parseFloat(parts[3].trim());
                        
                        if (isNaN(contestantNum) || isNaN(judgeNum) || isNaN(score)) {
                            continue;
                        }
                        
                        let categoryKey = null;
                        for (const key in categoryNames) {
                            if (categoryNames[key] === categoryName) {
                                categoryKey = key;
                                break;
                            }
                        }
                        
                        if (!categoryKey) {
                            console.warn('Category not found: ' + categoryName);
                            continue;
                        }
                        
                        if (!scoresData[categoryKey]) {
                            scoresData[categoryKey] = [];
                        }
                        
                        scoresData[categoryKey].push({
                            contestantNumber: contestantNum,
                            judgeNumber: judgeNum,
                            score: score
                        });
                        
                        importedCount++;
                    }
                    
                    if (importedCount === 0) {
                        alert('No valid scores found in CSV');
                        return;
                    }
                    
                    alert('Imported ' + importedCount + ' scores successfully!');
                }
                
                saveToStorage();
                populateScoreTables();
            } catch (error) {
                alert('Error parsing CSV: ' + error.message);
                console.error(error);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Remove the highest and lowest score from a list
function getAdjustedScores(scores) {
    if (scores.length <= 2) {
        return scores;
    }

    const sorted = [];
    for (let i = 0; i < scores.length; i++) {
        sorted.push(scores[i]);
    }

    for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
            if (sorted[j] < sorted[i]) {
                const temp = sorted[i];
                sorted[i] = sorted[j];
                sorted[j] = temp;
            }
        }
    }

    const adjusted = [];
    for (let i = 1; i < sorted.length - 1; i++) {
        adjusted.push(sorted[i]);
    }

    return adjusted;
}

// Carousel functions
function carouselNext() {
    const slides = document.querySelectorAll('.carousel-slide-inline');
    const dots = document.querySelectorAll('.dot-inline');
    currentCarouselIndex = (currentCarouselIndex + 1) % slides.length;
    carouselShow(currentCarouselIndex);
}

function carouselPrev() {
    const slides = document.querySelectorAll('.carousel-slide-inline');
    const dots = document.querySelectorAll('.dot-inline');
    currentCarouselIndex = (currentCarouselIndex - 1 + slides.length) % slides.length;
    carouselShow(currentCarouselIndex);
}

function carouselShow(n) {
    const slides = document.querySelectorAll('.carousel-slide-inline');
    const dots = document.querySelectorAll('.dot-inline');
    
    if (n >= slides.length) currentCarouselIndex = 0;
    if (n < 0) currentCarouselIndex = slides.length - 1;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[currentCarouselIndex].classList.add('active');
    dots[currentCarouselIndex].classList.add('active');
}

// Calculate final scores and rank contestants
function calculateFinalScores() {
    const contestantScores = {};

    for (let i = 0; i < contestants.length; i++) {
        contestantScores[contestants[i]] = {};
        for (let c = 0; c < categories.length; c++) {
            contestantScores[contestants[i]][categories[c]] = [];
        }
    }

    for (let c = 0; c < categories.length; c++) {
        const category = categories[c];
        for (let i = 0; i < scoresData[category].length; i++) {
            const item = scoresData[category][i];
            if (contestantScores[item.contestantNumber]) {
                contestantScores[item.contestantNumber][category].push(item.score);
            }
        }
    }

    const results = [];
    for (const contestantNum in contestantScores) {
        let allScores = [];
        const categoryBreakdown = {};
        const categoryAdjusted = {};
        const categoryAverages = {};
        const categoryTotals = {};

        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            const originalScores = contestantScores[contestantNum][category].slice();

            categoryBreakdown[category] = originalScores.slice();

            let adjustedScores = originalScores.slice();
            if (dropOutliers && adjustedScores.length > 0) {
                adjustedScores = getAdjustedScores(adjustedScores);
            }

            categoryAdjusted[category] = adjustedScores.slice();

            if (adjustedScores.length > 0) {
                let categoryTotal = 0;
                for (let j = 0; j < adjustedScores.length; j++) {
                    categoryTotal += adjustedScores[j];
                }
                categoryAverages[category] = (categoryTotal / adjustedScores.length).toFixed(2);
                categoryTotals[category] = categoryTotal;
            } else {
                categoryAverages[category] = '0.00';
                categoryTotals[category] = 0;
            }

            for (let j = 0; j < adjustedScores.length; j++) {
                allScores.push(adjustedScores[j]);
            }
        }

        if (allScores.length === 0) {
            continue;
        }

        let total = 0;
        for (let i = 0; i < allScores.length; i++) {
            total += allScores[i];
        }
        const average = (total / allScores.length).toFixed(2);
        
        results.push({
            contestantNumber: contestantNum,
            average: average,
            total: total.toFixed(2),
            categoryBreakdown: categoryBreakdown,
            categoryAdjusted: categoryAdjusted,
            categoryAverages: categoryAverages,
            categoryTotals: categoryTotals
        });
    }

    for (let i = 0; i < results.length; i++) {
        for (let j = i + 1; j < results.length; j++) {
            if (parseFloat(results[j].total) > parseFloat(results[i].total)) {
                const temp = results[i];
                results[i] = results[j];
                results[j] = temp;
            }
        }
    }

    displayFinalScores(results);
}

// Show all the results on the page
function displayFinalScores(results) {
    const display = document.getElementById('finalScoresDisplay');
    let html = '';
    
    if (dropOutliers) {
        html += '<p><em>Outliers Removed (Highest and Lowest scores per category)</em></p>';
    }

    html += '<div class="card mb-4 border-success">';
    html += '<div class="card-header bg-success text-white">';
    html += '<h4 class="mb-0">WINNERS & SUMMARY</h4>';
    html += '</div>';
    html += '<div class="card-body">';

    html += '<p><strong>Ranking Method:</strong> Total Scores</p>';

    html += '<h5>Highest Total Score:</h5>';
    let highestTotal = -Infinity;
    let highestTotalContestant = null;
    for (let i = 0; i < results.length; i++) {
        if (parseFloat(results[i].total) > highestTotal) {
            highestTotal = parseFloat(results[i].total);
            highestTotalContestant = results[i];
        }
    }
    html += '<p><strong>Contestant #' + highestTotalContestant.contestantNumber + '</strong> - Total: ' + highestTotalContestant.total + '</p>';

    html += '<h5>Category Winners (by total score' + (dropOutliers ? ', outliers removed' : '') + '):</h5>';
    for (let c = 0; c < categories.length; c++) {
        const category = categories[c];
        const categoryName = categoryNames[category];
        
        let highestCatTotal = -Infinity;
        let totalWinnerContestant = null;
        
        for (let i = 0; i < results.length; i++) {
            const categoryTotal = results[i].categoryTotals[category] || 0;
            
            if (categoryTotal > highestCatTotal) {
                highestCatTotal = categoryTotal;
                totalWinnerContestant = results[i].contestantNumber;
            }
        }
        
        html += '<p><strong>' + categoryName + ':</strong> Contestant #' + totalWinnerContestant + ' - Total: ' + highestCatTotal.toFixed(2) + '</p>';
    }

    html += '</div>';
    html += '</div>';

    if (results.length >= 1) {
        html += '<div class="card mb-4 border-warning">';
        html += '<div class="card-header bg-warning text-dark">';
        html += '<h4 class="mb-0">TOP 3 WINNERS CAROUSEL</h4>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<style>';
        html += '.carousel-container-inline { margin: 20px 0; }';
        html += '.carousel-wrapper-inline { position: relative; height: 500px; margin: 20px 0; overflow: hidden; border: 1px solid #ddd; background: #f9f9f9; }';
        html += '.carousel-slide-inline { position: absolute; width: 100%; height: 100%; opacity: 0; transition: opacity 0.5s; display: flex; flex-direction: column; justify-content: center; align-items: center; }';
        html += '.carousel-slide-inline.active { opacity: 1; z-index: 10; }';
        html += '.medal-image-inline { width: 300px; height: 300px; object-fit: contain; margin-bottom: 15px; }';
        html += '.winner-name-inline { font-size: 28px; font-weight: bold; margin: 10px 0; }';
        html += '.position-name-inline { font-size: 18px; color: #666; margin: 5px 0; }';
        html += '.carousel-controls-inline { display: flex; justify-content: center; gap: 15px; align-items: center; margin: 20px 0; }';
        html += '.carousel-controls-inline button { background: #007bff; color: white; border: none; padding: 8px 15px; cursor: pointer; }';
        html += '.carousel-controls-inline button:hover { background: #0056b3; }';
        html += '.dots-container-inline { display: flex; gap: 8px; }';
        html += '.dot-inline { width: 10px; height: 10px; border-radius: 50%; background: #ccc; cursor: pointer; }';
        html += '.dot-inline.active { background: #007bff; }';
        html += '</style>';
        html += '<div class="carousel-container-inline">';
        html += '<div class="carousel-wrapper-inline">';

        for (let i = 2; i >= 0; i--) {
            if (i >= results.length) continue;
            
            const result = results[i];
            const slideIndex = 2 - i;
            const isActive = slideIndex === 0 ? ' active' : '';
            let medal = '';

            if (i === 2) {
                medal = 'Photos/3rd.png';
            } else if (i === 1) {
                medal = 'Photos/2nd.png';
            } else if (i === 0) {
                medal = 'Photos/1st.png';
            }

            html += '<div class="carousel-slide-inline' + isActive + '">';
            html += '<img src="' + medal + '" alt="Contestant" class="medal-image-inline">';
            html += '<div class="winner-name-inline">Contestant #' + result.contestantNumber + '</div>';
            html += '</div>';
        }

        html += '</div>';
        html += '<div class="carousel-controls-inline">';
        html += '<button onclick="carouselPrev()">← Prev</button>';
        html += '<div class="dots-container-inline">';
        
        for (let i = 0; i < Math.min(3, results.length); i++) {
            const dotActive = i === 0 ? ' active' : '';
            html += '<span class="dot-inline' + dotActive + '" onclick="carouselShow(' + i + ')"></span>';
        }
        
        html += '</div>';
        html += '<button onclick="carouselNext()">Next →</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }

    html += '<div class="card mb-3">';
    html += '<div class="card-header bg-primary text-white">';
    html += '<h4 class="mb-0">Detailed Breakdown by Contestant</h4>';
    html += '</div>';
    html += '<div class="card-body">';

    const rankLabels = ['WINNER', '1ST ALTERNATE', '2ND ALTERNATE'];

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const rankLabel = rankLabels[i] || 'Rank #' + (i + 1);
        
        html += '<div class="mb-4">';
        html += '<h5>' + rankLabel + ' - <span>Contestant #' + result.contestantNumber + '</span></h5>';
        
        html += '<h6>Category Breakdown' + (dropOutliers ? ' (outliers removed)' : '') + ':</h6>';
        html += '<table class="table table-sm">';
        html += '<thead><tr><th>Category</th><th>Total Score</th><th>Average</th></tr></thead>';
        html += '<tbody>';
        
        for (let j = 0; j < categories.length; j++) {
            const category = categories[j];
            const totalCategoryScore = result.categoryTotals[category] || 0;
            
            const categoryName = categoryNames[category];
            const categoryAverage = result.categoryAverages[category];
            html += '<tr>';
            html += '<td>' + categoryName + '</td>';
            html += '<td><strong>' + totalCategoryScore.toFixed(2) + '</strong></td>';
            html += '<td><strong>' + categoryAverage + '</strong></td>';
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        
        html += '<div style="margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 4px;">';
        html += '<p><strong>Total All Scores:</strong> ' + result.total + '</p>';
        html += '</div>';
        
        html += '</div>';
    }

    html += '</div>';
    html += '</div>';

    html += '<div class="card mb-4 border-info">';
    html += '<div class="card-header bg-info text-white">';
    html += '<h4 class="mb-0">Judge Overall Averages Per Contestant</h4>';
    html += '</div>';
    html += '<div class="card-body">';
    html += '<table class="table table-sm">';
    html += '<thead><tr><th>Contestant #</th>';
    
    for (let j = 0; j < judges.length; j++) {
        html += '<th>Judge #' + judges[j] + '</th>';
    }
    html += '<th>Judge Avg</th></tr></thead>';
    html += '<tbody>';

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        html += '<tr>';
        html += '<td><strong>Contestant #' + result.contestantNumber + '</strong></td>';

        const judgeAverages = {};
        for (let c = 0; c < categories.length; c++) {
            const category = categories[c];
            for (let s = 0; s < scoresData[category].length; s++) {
                const scoreItem = scoresData[category][s];
                if (scoreItem.contestantNumber == result.contestantNumber) {
                    if (!judgeAverages[scoreItem.judgeNumber]) {
                        judgeAverages[scoreItem.judgeNumber] = [];
                    }
                    judgeAverages[scoreItem.judgeNumber].push(scoreItem.score);
                }
            }
        }

        let allJudgeScores = [];
        for (let j = 0; j < judges.length; j++) {
            const judgeNum = judges[j];
            let judgeAvg = '-';
            if (judgeAverages[judgeNum]) {
                let judgeTotal = 0;
                for (let s = 0; s < judgeAverages[judgeNum].length; s++) {
                    judgeTotal += judgeAverages[judgeNum][s];
                    allJudgeScores.push(judgeAverages[judgeNum][s]);
                }
                judgeAvg = (judgeTotal / judgeAverages[judgeNum].length).toFixed(2);
            }
            html += '<td>' + judgeAvg + '</td>';
        }

        let judgeOverallAvg = '-';
        if (allJudgeScores.length > 0) {
            let totalJudgeScores = 0;
            for (let s = 0; s < allJudgeScores.length; s++) {
                totalJudgeScores += allJudgeScores[s];
            }
            judgeOverallAvg = (totalJudgeScores / allJudgeScores.length).toFixed(2);
        }
        html += '<td><strong>' + judgeOverallAvg + '</strong></td>';
        html += '</tr>';
    }

    html += '</tbody></table>';
    html += '</div>';
    html += '</div>';

    display.innerHTML = html;
}

// Save scores to browser storage
function saveToStorage() {
    localStorage.setItem('pageantScores', JSON.stringify(scoresData));
}

// Load saved data from browser storage when page opens
function loadFromStorage() {
    const storedContestants = localStorage.getItem('pageantContestants');
    if (storedContestants) {
        contestants = JSON.parse(storedContestants);
        
        contestantNames = {};
        for (let i = 0; i < contestants.length; i++) {
            contestantNames[contestants[i]] = 'Contestant #' + contestants[i];
        }
        
        const display = document.getElementById('contestantListDisplay');
        if (display) {
            let html = '<p><strong>Contestants loaded:</strong> ' + contestants.length + ' contestants</p>';
            display.innerHTML = html;
        }
    }

    const storedCategories = localStorage.getItem('pageantCategories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
        
        const storedCategoryNames = localStorage.getItem('pageantCategoryNames');
        if (storedCategoryNames) {
            categoryNames = JSON.parse(storedCategoryNames);
        }

        for (let i = 0; i < categories.length; i++) {
            scoresData[categories[i]] = [];
        }
    }

    const storedJudges = localStorage.getItem('pageantJudges');
    if (storedJudges) {
        judges = JSON.parse(storedJudges);
        
        const display = document.getElementById('judgeListDisplay');
        if (display) {
            let html = '<p><strong>Judges loaded:</strong> ' + judges.length + ' judges</p>';
            display.innerHTML = html;
        }
    }

    const stored = localStorage.getItem('pageantScores');
    if (stored) {
        const parsed = JSON.parse(stored);
        for (const key in parsed) {
            scoresData[key] = parsed[key];
        }
    }
}

// Load saved data when page first opens
loadFromStorage();


// PWA Install functionality
let deferredPrompt;

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display = 'inline-block';
});

// Handle install button click
function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

// Add event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        createContestantBtn: setupContestants,
        createCategoryBtn: setupCategories,
        createJudgeBtn: setupJudges,
        calculateBtn: calculateFinalScores,
        exportBtn: exportToCSV,
        importBtn: importFromCSV,
        clearBtn: clearAllData,
        demoBtn: loadDemoData,
        installBtn: installApp,
        outlierToggle: toggleOutliers,
        downloadBlankBtn: downloadBlankScores,
        downloadFilledBtn: downloadFilledScores
    };

    for (const [id, handler] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'outlierToggle') {
                element.addEventListener('change', handler);
            } else {
                element.addEventListener('click', handler);
            }
        } else {
            console.warn(`Element with id "${id}" not found`);
        }
    }
});
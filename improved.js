"use strict";

// Store contestant numbers and names
let contestants = [];
let contestantNames = {};

// Store judge numbers
let judges = [];

// Store category names
let categories = [];
let categoryNames = {};

// Store all scores
const scoresData = {};

// Check if we should remove high and low scores
let dropOutliers = false;

// Carousel variables
let currentCarouselIndex = 0;

// Create contestant list
function setupContestants() {
    console.log('setupContestants called');
    const numInput = document.getElementById('numContestants');
    console.log('numInput element:', numInput);
    
    if (!numInput) {
        console.error('numContestants element not found!');
        alert('Error: numContestants element not found');
        return;
    }
    
    const num = parseInt(numInput.value);
    console.log('Number entered:', num);

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

    console.log('Contestants array:', contestants);

    // Show the list on page
    const display = document.getElementById('contestantListDisplay');
    if (display) {
        let html = '<p><strong>Contestants created:</strong> ' + num + ' contestants</p>';
        display.innerHTML = html;
        console.log('Display updated successfully');
    } else {
        console.error('contestantListDisplay element not found!');
    }

    // Save to browser storage
    localStorage.setItem('pageantContestants', JSON.stringify(contestants));
    console.log('Saved to localStorage');
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

    // Show input boxes for category names
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

    // Save to browser storage
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

    // Start storing scores for each category
    for (let i = 0; i < categories.length; i++) {
        scoresData[categories[i]] = [];
    }

    // Save to browser storage
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

    // Show the judge count on page
    const display = document.getElementById('judgeListDisplay');
    if (display) {
        let html = '<p><strong>Judges created:</strong> ' + num + ' judges</p>';
        display.innerHTML = html;
        console.log('Judges display updated successfully');
    } else {
        console.error('judgeListDisplay element not found!');
    }

    // Create score tables
    generateScoreTables();

    // Save to browser storage
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

    // Make a table for each category
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

        // Add judge column headers
        for (let j = 0; j < judges.length; j++) {
            html += '<th>Judge #' + judges[j] + '</th>';
        }

        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';

        // Add rows for each contestant
        for (let c = 0; c < contestants.length; c++) {
            const contestantNum = contestants[c];
            html += '<tr>';
            html += '<td><strong>Contestant #' + contestantNum + '</strong></td>';

            // Add input boxes for each judge score
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
}

// Save all scores for one category
function saveScoresForCategory(category) {
    // Clear old scores for this category
    scoresData[category] = [];

    let savedCount = 0;

    // Get all scores from input boxes
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

// Clear all data and reset the calculator
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        // Clear all variables
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
        
        // Clear all localStorage
        localStorage.removeItem('pageantContestants');
        localStorage.removeItem('pageantJudges');
        localStorage.removeItem('pageantCategories');
        localStorage.removeItem('pageantCategoryNames');
        localStorage.removeItem('pageantScores');
        
        // Clear all displays
        document.getElementById('contestantListDisplay').innerHTML = '';
        document.getElementById('categoryInputsDisplay').innerHTML = '';
        document.getElementById('judgeListDisplay').innerHTML = '';
        document.getElementById('scoreTableSection').style.display = 'none';
        document.getElementById('scoreTableContainer').innerHTML = '';
        document.getElementById('finalScoresDisplay').innerHTML = '';
        
        // Clear all input fields
        document.getElementById('numContestants').value = '';
        document.getElementById('numCategories').value = '';
        document.getElementById('numJudges').value = '';
        
        alert('All data has been cleared!');
    }
}

// Clear all data and reset the calculator
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        // Clear all variables
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
        
        // Clear all localStorage
        localStorage.removeItem('pageantContestants');
        localStorage.removeItem('pageantJudges');
        localStorage.removeItem('pageantCategories');
        localStorage.removeItem('pageantCategoryNames');
        localStorage.removeItem('pageantScores');
        
        // Clear all displays
        document.getElementById('contestantListDisplay').innerHTML = '';
        document.getElementById('categoryInputsDisplay').innerHTML = '';
        document.getElementById('judgeListDisplay').innerHTML = '';
        document.getElementById('scoreTableSection').style.display = 'none';
        document.getElementById('scoreTableContainer').innerHTML = '';
        document.getElementById('finalScoresDisplay').innerHTML = '';
        
        // Clear all input fields
        document.getElementById('numContestants').value = '';
        document.getElementById('numCategories').value = '';
        document.getElementById('numJudges').value = '';
        
        alert('All data has been cleared!');
    }
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

    // Sort from lowest to highest
    for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
            if (sorted[j] < sorted[i]) {
                const temp = sorted[i];
                sorted[i] = sorted[j];
                sorted[j] = temp;
            }
        }
    }

    // Remove lowest and highest
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

    // Create empty score holder for each contestant
    for (let i = 0; i < contestants.length; i++) {
        contestantScores[contestants[i]] = {};
        for (let c = 0; c < categories.length; c++) {
            contestantScores[contestants[i]][categories[c]] = [];
        }
    }

    // Add all scores to the holders
    for (let c = 0; c < categories.length; c++) {
        const category = categories[c];
        for (let i = 0; i < scoresData[category].length; i++) {
            const item = scoresData[category][i];
            if (contestantScores[item.contestantNumber]) {
                contestantScores[item.contestantNumber][category].push(item.score);
            }
        }
    }

    // Calculate totals for each contestant
    const results = [];
    for (const contestantNum in contestantScores) {
        let allScores = [];
        const categoryBreakdown = {};
        const categoryAverages = {};

        // Get scores from each category
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            let categoryScores = contestantScores[contestantNum][category];

            // Save original scores
            categoryBreakdown[category] = categoryScores.slice();

            // Remove high and low if checkbox is on
            if (dropOutliers && categoryScores.length > 0) {
                categoryScores = getAdjustedScores(categoryScores);
            }

            // Calculate average for this category
            if (categoryScores.length > 0) {
                let categoryTotal = 0;
                for (let j = 0; j < categoryScores.length; j++) {
                    categoryTotal += categoryScores[j];
                }
                categoryAverages[category] = (categoryTotal / categoryScores.length).toFixed(2);
            } else {
                categoryAverages[category] = '0.00';
            }

            // Add all scores together
            for (let j = 0; j < categoryScores.length; j++) {
                allScores.push(categoryScores[j]);
            }
        }

        if (allScores.length === 0) {
            continue;
        }

        // Calculate overall total
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
            categoryAverages: categoryAverages
        });
    }

    // Sort by total scores (highest first)
    for (let i = 0; i < results.length; i++) {
        for (let j = i + 1; j < results.length; j++) {
            if (parseFloat(results[j].total) > parseFloat(results[i].total)) {
                const temp = results[i];
                results[i] = results[j];
                results[j] = temp;
            }
        }
    }

    // Show the results
    displayFinalScores(results);
}

// Show all the results on the page
function displayFinalScores(results) {
    const display = document.getElementById('finalScoresDisplay');
    let html = '';
    
    if (dropOutliers) {
        html += '<p><em>Outliers Removed (Highest and Lowest scores per category)</em></p>';
    }

    // SUMMARY SECTION
    html += '<div class="card mb-4 border-success">';
    html += '<div class="card-header bg-success text-white">';
    html += '<h4 class="mb-0">WINNERS & SUMMARY</h4>';
    html += '</div>';
    html += '<div class="card-body">';

    html += '<p><strong>Ranking Method:</strong> Total Scores</p>';

    // Show Highest Total Score (winner)
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

    // Category Winners (by total score)
    html += '<h5>Category Winners (by total score):</h5>';
    for (let c = 0; c < categories.length; c++) {
        const category = categories[c];
        const categoryName = categoryNames[category];
        
        // Show category with highest total
        let highestCatTotal = -Infinity;
        let totalWinnerContestant = null;
        
        for (let i = 0; i < results.length; i++) {
            let categoryTotal = 0;
            const categoryScores = results[i].categoryBreakdown[category];
            if (categoryScores && categoryScores.length > 0) {
                for (let j = 0; j < categoryScores.length; j++) {
                    categoryTotal += categoryScores[j];
                }
            }
            
            if (categoryTotal > highestCatTotal) {
                highestCatTotal = categoryTotal;
                totalWinnerContestant = results[i].contestantNumber;
            }
        }
        
        html += '<p><strong>' + categoryName + ':</strong> Contestant #' + totalWinnerContestant + ' - Total: ' + highestCatTotal.toFixed(2) + '</p>';
    }

    html += '</div>';
    html += '</div>';

    // CAROUSEL SECTION FOR TOP 3 WINNERS
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

        // Carousel slides - show 3rd, 2nd, then 1st
        for (let i = 2; i >= 0; i--) {
            if (i >= results.length) continue;
            
            const result = results[i];
            const slideIndex = 2 - i; // 0, 1, 2
            const isActive = slideIndex === 0 ? ' active' : '';
            let medal = '';

            // Use web-friendly relative paths for medal images stored in the Photos folder
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

    // Detailed breakdown for each contestant
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
        
        // Show breakdown by category
        html += '<h6>Category Breakdown:</h6>';
        html += '<table class="table table-sm">';
        html += '<thead><tr><th>Category</th><th>Total Score</th><th>Average</th></tr></thead>';
        html += '<tbody>';
        
        for (let j = 0; j < categories.length; j++) {
            const category = categories[j];
            const categoryScores = result.categoryBreakdown[category];
            
            let totalCategoryScore = 0;
            
            if (categoryScores && categoryScores.length > 0) {
                for (let k = 0; k < categoryScores.length; k++) {
                    totalCategoryScore += categoryScores[k];
                }
            }
            
            const categoryName = categoryNames[category];
            const categoryAverage = result.categoryAverages[category];
            html += '<tr>';
            html += '<td>' + categoryName + '</td>';
            html += '<td><strong>' + totalCategoryScore + '</strong></td>';
            html += '<td><strong>' + categoryAverage + '</strong></td>';
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        
        // Show score summary
        html += '<div style="margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 4px;">';
        html += '<p><strong>Total All Scores:</strong> ' + result.total + '</p>';
        html += '</div>';
        
        html += '</div>';
    }

    html += '</div>';
    html += '</div>';

    // Judge averages for each contestant
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

        // Calculate each judge's average for this contestant
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

        // Calculate average of all judge averages
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

        // Start storing scores for each category
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

// Initialize jQuery Accordion when page loads
$(document).ready(function() {
    $("#accordion").accordion({
        collapsible: true,
        active: 0
    });
});

// Register Service Worker
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/Score-Calculator/sw.js', 
        {scope: '/Score-Calculator/'});
}

// PWA Install functionality
let deferredPrompt;

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Stash the event for later use
    deferredPrompt = e;
    // Show the install button
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
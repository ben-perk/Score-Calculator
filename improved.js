"use strict";

const APP_VERSION = '1.0.8';

let contestants = [];
let contestantNames = {};
let judges = [];
let categories = [];
let categoryNames = {};
let scoresData = {};
let dropOutliers = false;
let currentCarouselIndex = 0;

// FUNCTION 1: Setup Contestants
function setupContestants() {
    const numInput = document.getElementById('numContestants');
    if (!numInput) { alert('Error: numContestants element not found'); return; }
    const num = parseInt(numInput.value);
    if (isNaN(num) || num < 1) { alert('Please enter a valid number of contestants'); return; }
    contestants = [];
    contestantNames = {};
    for (let i = 1; i <= num; i++) {
        contestants.push(i);
        contestantNames[i] = 'Contestant #' + i;
    }
    const display = document.getElementById('contestantListDisplay');
    if (display) display.innerHTML = `Contestants created: ${num} contestants`;
    localStorage.setItem('pageantContestants', JSON.stringify(contestants));
}

// FUNCTION 2: Setup Categories
function setupCategories() {
    console.log('setupCategories called');
    const numInput = document.getElementById('numCategories');
    if (!numInput) { console.error('numCategories not found'); alert('Error: numCategories element not found'); return; }
    const num = parseInt(numInput.value);
    console.log('Number of categories:', num);
    if (isNaN(num) || num < 1) { alert('Please enter a valid number of categories'); return; }
    categories = [];
    categoryNames = {};
    for (let i = 1; i <= num; i++) {
        categories.push('category_' + i);
        categoryNames['category_' + i] = 'Category #' + i;
    }
    console.log('Categories:', categories);
    const display = document.getElementById('categoryInputsDisplay');
    if (display) {
        let html = '<h4>Enter Category Names</h4><div class="row">';
        for (let i = 0; i < categories.length; i++) {
            const catKey = categories[i];
            html += '<div class="col-md-6 mb-3">';
            html += '<label for="categoryName' + i + '" class="form-label">Category #' + (i + 1) + ' Name:</label>';
            html += '<input type="text" id="categoryName' + i + '" class="form-control" placeholder="Enter category name" value="' + categoryNames[catKey] + '">';
            html += '</div>';
        }
        html += '</div><button class="btn btn-success mt-3" onclick="saveCategoryNames()">Save Category Names</button>';
        display.innerHTML = html;
    }
    localStorage.setItem('pageantCategories', JSON.stringify(categories));
    localStorage.setItem('pageantCategoryNames', JSON.stringify(categoryNames));
}

// FUNCTION 3: Save Category Names
function saveCategoryNames() {
    for (let i = 0; i < categories.length; i++) {
        const catKey = categories[i];
        const nameInput = document.getElementById('categoryName' + i);
        const name = nameInput.value.trim();
        if (name) categoryNames[catKey] = name;
    }
    for (let i = 0; i < categories.length; i++) {
        scoresData[categories[i]] = [];
    }
    localStorage.setItem('pageantCategoryNames', JSON.stringify(categoryNames));
    alert('Category names saved!');
}

// FUNCTION 4: Setup Judges
function setupJudges() {
    console.log('setupJudges called');
    const numInput = document.getElementById('numJudges');
    if (!numInput) { console.error('numJudges not found'); alert('Error: numJudges element not found'); return; }
    const num = parseInt(numInput.value);
    console.log('Number of judges:', num);
    if (isNaN(num) || num < 1) { alert('Please enter a valid number of judges'); return; }
    judges = [];
    for (let i = 1; i <= num; i++) judges.push(i);
    console.log('Judges:', judges);
    const display = document.getElementById('judgeListDisplay');
    if (display) {
        display.innerHTML = '<p><strong>Judges created:</strong> ' + num + ' judges</p>';
        console.log('Judges display updated');
    }
    generateScoreTables();
    localStorage.setItem('pageantJudges', JSON.stringify(judges));
}

// FUNCTION 5: Generate Score Tables
function generateScoreTables() {
    const scoreTableSection = document.getElementById('scoreTableSection');
    const scoreTableContainer = document.getElementById('scoreTableContainer');
    if (!scoreTableSection || !scoreTableContainer) { console.error('Score table elements not found'); return; }
    if (!contestants.length) { alert('Please create contestants first'); return; }
    if (!categories.length) { alert('Please create categories first'); return; }
    if (!judges.length) { alert('Please create judges first'); return; }
    
    let html = '';
    for (let cat = 0; cat < categories.length; cat++) {
        const category = categories[cat];
        const categoryName = categoryNames[category];
        html += '<div class="card mb-4"><div class="card-header bg-info text-white"><h4 class="mb-0">' + categoryName + '</h4></div>';
        html += '<div class="card-body"><table class="table table-bordered"><thead><tr><th>Contestant #</th>';
        for (let j = 0; j < judges.length; j++) html += '<th>Judge #' + judges[j] + '</th>';
        html += '</tr></thead><tbody>';
        for (let c = 0; c < contestants.length; c++) {
            const contestantNum = contestants[c];
            html += '<tr><td><strong>Contestant #' + contestantNum + '</strong></td>';
            for (let j = 0; j < judges.length; j++) {
                const judgeNum = judges[j];
                const inputId = 'score_' + category + '_' + contestantNum + '_' + judgeNum;
                html += '<td><input type="number" id="' + inputId + '" class="form-control" min="1" max="1000" value=""></td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table><button class="btn btn-success mt-2" onclick="saveScoresForCategory(\'' + category + '\')">Save ' + categoryName + ' Scores</button></div></div>';
    }
    html += '<button class="btn btn-primary mt-3" onclick="calculateFinalScores()">Calculate Final Scores</button>';
    scoreTableContainer.innerHTML = html;
    scoreTableSection.style.display = 'block';
    populateScoreTables();
}

// FUNCTION 6: Populate Score Tables
function populateScoreTables() {
    for (let cat = 0; cat < categories.length; cat++) {
        const category = categories[cat];
        if (!scoresData[category]) continue;
        for (let i = 0; i < scoresData[category].length; i++) {
            const scoreItem = scoresData[category][i];
            const inputId = 'score_' + category + '_' + scoreItem.contestantNumber + '_' + scoreItem.judgeNumber;
            const input = document.getElementById(inputId);
            if (input) input.value = scoreItem.score;
        }
    }
}

// FUNCTION 7: Save Scores For Category
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
                    scoresData[category].push({ contestantNumber: contestantNum, judgeNumber: judgeNum, score: score });
                    savedCount++;
                }
            }
        }
    }
    alert('Saved ' + savedCount + ' scores for ' + categoryNames[category]);
    saveToStorage();
}

// FUNCTION 8: Toggle Outliers
function toggleOutliers() {
    dropOutliers = !dropOutliers;
    const toggle = document.getElementById('outlierToggle');
    if (toggle) toggle.checked = dropOutliers;
}

// FUNCTION 9: Clear All Data Silent
function clearAllDataSilent() {
    contestants = [];
    contestantNames = {};
    judges = [];
    categories = [];
    categoryNames = {};
    for (const key in scoresData) delete scoresData[key];
    dropOutliers = false;
    currentCarouselIndex = 0;
}

// FUNCTION 10: Clear All Data
function clearAllData() {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) return;
    clearAllDataSilent();
    localStorage.clear();
    const el1 = document.getElementById('contestantListDisplay');
    const el2 = document.getElementById('categoryInputsDisplay');
    const el3 = document.getElementById('judgeListDisplay');
    const el4 = document.getElementById('scoreTableSection');
    const el5 = document.getElementById('scoreTableContainer');
    const el6 = document.getElementById('finalScoresDisplay');
    const el7 = document.getElementById('numContestants');
    const el8 = document.getElementById('numCategories');
    const el9 = document.getElementById('numJudges');
    
    if (el1) el1.innerHTML = '';
    if (el2) el2.innerHTML = '';
    if (el3) el3.innerHTML = '';
    if (el4) el4.style.display = 'none';
    if (el5) el5.innerHTML = '';
    if (el6) el6.innerHTML = '';
    if (el7) el7.value = '';
    if (el8) el8.value = '';
    if (el9) el9.value = '';
    alert('All data has been cleared!');
}

// FUNCTION 11: Load Demo Data - FIXED FOR CORS
function loadDemoData() {
    if (!confirm('This will replace all current data. Continue?')) return;
    clearAllDataSilent();
    
    fetch('example.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }
            return response.json();
        })
        .then(demoData => {
            contestants = [];
            contestantNames = {};
            for (let i = 0; i < demoData.contestants.length; i++) {
                const c = demoData.contestants[i];
                contestants.push(c.number);
                contestantNames[c.number] = c.name;
            }
            judges = demoData.judges.slice();
            categories = [];
            categoryNames = {};
            for (let i = 0; i < demoData.categories.length; i++) {
                const cat = demoData.categories[i];
                categories.push(cat.id);
                categoryNames[cat.id] = cat.name;
            }
            for (let i = 0; i < categories.length; i++) {
                scoresData[categories[i]] = [];
            }
            for (let i = 0; i < demoData.scores.length; i++) {
                const scoreItem = demoData.scores[i];
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
            const display = document.getElementById('contestantListDisplay');
            if (display) display.innerHTML = '<p><strong>Contestants loaded:</strong> ' + contestants.length + ' contestants</p>';
            const judgeDisplay = document.getElementById('judgeListDisplay');
            if (judgeDisplay) judgeDisplay.innerHTML = '<p><strong>Judges loaded:</strong> ' + judges.length + ' judges</p>';
            const categoryDisplay = document.getElementById('categoryInputsDisplay');
            if (categoryDisplay) {
                let html = '<h4>Categories Loaded</h4><ul>';
                for (let i = 0; i < categories.length; i++) {
                    const catKey = categories[i];
                    html += '<li>' + categoryNames[catKey] + '</li>';
                }
                html += '</ul>';
                categoryDisplay.innerHTML = html;
            }
            generateScoreTables();
            saveToStorage();
            localStorage.setItem('pageantContestants', JSON.stringify(contestants));
            localStorage.setItem('pageantJudges', JSON.stringify(judges));
            localStorage.setItem('pageantCategories', JSON.stringify(categories));
            localStorage.setItem('pageantCategoryNames', JSON.stringify(categoryNames));
            alert('Demo data loaded successfully!');
        })
        .catch(error => {
            console.error('Demo data load error:', error);
            alert('Error loading demo data: ' + error.message + '\n\nNote: Demo data requires running from a web server (not file://). \n\nTo fix this:\n1. Use Python: python -m http.server 8000\n2. Or just manually enter your data using the forms above.');
        });
}

// FUNCTION 12: Calculate Full Results
function calculateFullResults() {
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
        if (allScores.length === 0) continue;
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
    return results;
}

// FUNCTION 13: Get Adjusted Scores
function getAdjustedScores(scores) {
    if (scores.length <= 2) return scores;
    const sorted = scores.slice().sort((a, b) => a - b);
    return sorted.slice(1, -1);
}

// FUNCTION 14: Carousel Next
function carouselNext() {
    const slides = document.querySelectorAll('.carousel-slide-inline');
    currentCarouselIndex = (currentCarouselIndex + 1) % slides.length;
    carouselShow(currentCarouselIndex);
}

// FUNCTION 15: Carousel Prev
function carouselPrev() {
    const slides = document.querySelectorAll('.carousel-slide-inline');
    currentCarouselIndex = (currentCarouselIndex - 1 + slides.length) % slides.length;
    carouselShow(currentCarouselIndex);
}

// FUNCTION 16: Carousel Show
function carouselShow(n) {
    const slides = document.querySelectorAll('.carousel-slide-inline');
    const dots = document.querySelectorAll('.dot-inline');
    if (n >= slides.length) currentCarouselIndex = 0;
    if (n < 0) currentCarouselIndex = slides.length - 1;
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[currentCarouselIndex].classList.add('active');
    dots[currentCarouselIndex].classList.add('active');
}

// FUNCTION 17: Calculate Final Scores
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
        if (allScores.length === 0) continue;
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

// FUNCTION 18: Display Final Scores
function displayFinalScores(results) {
    const display = document.getElementById('finalScoresDisplay');
    let html = '';
    if (dropOutliers) {
        html += '<p><em>Outliers Removed (Highest and Lowest scores per category)</em></p>';
    }
    html += '<div class="card mb-4 border-success"><div class="card-header bg-success text-white"><h4 class="mb-0">WINNERS & SUMMARY</h4></div><div class="card-body">';
    html += '<p><strong>Ranking Method:</strong> Total Scores</p><h5>Highest Total Score:</h5>';
    let highestTotal = -Infinity;
    let highestTotalContestant = null;
    for (let i = 0; i < results.length; i++) {
        if (parseFloat(results[i].total) > highestTotal) {
            highestTotal = parseFloat(results[i].total);
            highestTotalContestant = results[i];
        }
    }
    html += '<p><strong>Contestant #' + highestTotalContestant.contestantNumber + '</strong> - Total: ' + highestTotalContestant.total + '</p>';
    html += '<h5>Category Winners:</h5>';
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
    html += '</div></div>';
    if (results.length >= 1) {
        html += '<div class="card mb-4 border-warning"><div class="card-header bg-warning text-dark"><h4 class="mb-0">TOP 3 WINNERS CAROUSEL</h4></div><div class="card-body"><div class="carousel-wrapper-inline">';
        for (let i = 2; i >= 0; i--) {
            if (i >= results.length) continue;
            const result = results[i];
            const slideIndex = 2 - i;
            const isActive = slideIndex === 0 ? ' active' : '';
            let medal = '';
            if (i === 2) medal = 'Photos/3rd.png';
            else if (i === 1) medal = 'Photos/2nd.png';
            else if (i === 0) medal = 'Photos/1st.png';
            html += '<div class="carousel-slide-inline' + isActive + '"><img src="' + medal + '" alt="Contestant" class="medal-image-inline"><div class="winner-name-inline">Contestant #' + result.contestantNumber + '</div></div>';
        }
        html += '</div><div class="carousel-controls-inline"><button onclick="carouselPrev()">← Prev</button><div class="dots-container-inline">';
        for (let i = 0; i < Math.min(3, results.length); i++) {
            const dotActive = i === 0 ? ' active' : '';
            html += '<span class="dot-inline' + dotActive + '" onclick="carouselShow(' + i + ')"></span>';
        }
        html += '</div><button onclick="carouselNext()">Next →</button></div></div></div>';
    }
    html += '<div class="card mb-3"><div class="card-header bg-primary text-white"><h4 class="mb-0">Detailed Breakdown by Contestant</h4></div><div class="card-body">';
    const rankLabels = ['WINNER', '1ST ALTERNATE', '2ND ALTERNATE'];
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const rankLabel = rankLabels[i] || 'Rank #' + (i + 1);
        html += '<div class="mb-4"><h5>' + rankLabel + ' - <span>Contestant #' + result.contestantNumber + '</span></h5><h6>Category Breakdown' + (dropOutliers ? ' (outliers removed)' : '') + ':</h6>';
        html += '<table class="table table-sm"><thead><tr><th>Category</th><th>Total Score</th><th>Average</th></tr></thead><tbody>';
        for (let j = 0; j < categories.length; j++) {
            const category = categories[j];
            const totalCategoryScore = result.categoryTotals[category] || 0;
            const categoryName = categoryNames[category];
            const categoryAverage = result.categoryAverages[category];
            html += '<tr><td>' + categoryName + '</td><td><strong>' + totalCategoryScore.toFixed(2) + '</strong></td><td><strong>' + categoryAverage + '</strong></td></tr>';
        }
        html += '</tbody></table><div style="margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 4px;"><p><strong>Total All Scores:</strong> ' + result.total + '</p></div></div>';
    }
    html += '</div></div><div class="card mb-4 border-info"><div class="card-header bg-info text-white"><h4 class="mb-0">Judge Overall Averages Per Contestant</h4></div><div class="card-body"><table class="table table-sm"><thead><tr><th>Contestant #</th>';
    for (let j = 0; j < judges.length; j++) {
        html += '<th>Judge #' + judges[j] + '</th>';
    }
    html += '<th>Judge Avg</th></tr></thead><tbody>';
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        html += '<tr><td><strong>Contestant #' + result.contestantNumber + '</strong></td>';
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
        html += '<td><strong>' + judgeOverallAvg + '</strong></td></tr>';
    }
    html += '</tbody></table></div></div>';
    display.innerHTML = html;
}

// FUNCTION 19: Save To Storage
function saveToStorage() {
    localStorage.setItem('pageantScores', JSON.stringify(scoresData));
}

// FUNCTION 20: Load From Storage
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
            display.innerHTML = '<p><strong>Contestants loaded:</strong> ' + contestants.length + ' contestants</p>';
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
        const catDisplay = document.getElementById('categoryInputsDisplay');
        if (catDisplay && categories.length > 0) {
            let html = '<h4>Categories Loaded</h4><ul>';
            for (let i = 0; i < categories.length; i++) {
                html += '<li>' + categoryNames[categories[i]] + '</li>';
            }
            html += '</ul>';
            catDisplay.innerHTML = html;
        }
    }
    const storedJudges = localStorage.getItem('pageantJudges');
    if (storedJudges) {
        judges = JSON.parse(storedJudges);
        const display = document.getElementById('judgeListDisplay');
        if (display) {
            display.innerHTML = '<p><strong>Judges loaded:</strong> ' + judges.length + ' judges</p>';
        }
    }
    const storedScores = localStorage.getItem('pageantScores');
    if (storedScores) {
        const parsed = JSON.parse(storedScores);
        for (const key in parsed) {
            scoresData[key] = parsed[key];
        }
    }
    if (contestants.length > 0 && categories.length > 0 && judges.length > 0) {
        generateScoreTables();
    }
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        createContestantBtn: setupContestants,
        createCategoryBtn: setupCategories,
        createJudgeBtn: setupJudges,
        calculateBtn: calculateFinalScores,
        exportBtn: exportToExcel,
        clearBtn: clearAllData,
        demoBtn: loadDemoData,
        outlierToggle: toggleOutliers,
        downloadTemplateBtn: downloadBlankTemplate,
        importTemplateBtn: importFromTemplate,
    };

    for (const [id, handler] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'outlierToggle') {
                element.addEventListener('change', handler);
            } else {
                element.addEventListener('click', handler);
            }
        }
    }

    loadFromStorage();
});
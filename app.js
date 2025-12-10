"use strict";

let contestants = [];
let contestantNames = {};
let judges = [];
let categories = [];
let categoryNames = {};
let scoresData = {};
let dropOutliers = false;

// SETUP CONTESTANTS
function setupContestants() {
    const numInput = document.getElementById('numContestants');
    if (!numInput) { alert('Error: numContestants element not found'); return; }

    const num = parseInt(numInput.value);
    if (isNaN(num) || num < 1) { alert('Please enter a valid number of contestants'); return; }

    contestants = [];
    contestantNames = {};
    for (let i = 1; i <= num; i++) {
        contestants.push(i);
        contestantNames[i] = 'Contestant ' + i;
    }

    const display = document.getElementById('contestantListDisplay');
    if (display) { display.innerHTML = 'Contestants created: ' + num; }
}

// SETUP CATEGORIES
function setupCategories() {
    const numInput = document.getElementById('numCategories');
    if (!numInput) { alert('Error: numCategories element not found'); return; }
    
    const num = parseInt(numInput.value);
    if (isNaN(num) || num < 1) { alert('Please enter a valid number of categories'); return; }

    categories = [];
    categoryNames = {};
    for (let i = 1; i <= num; i++) {
        categories.push('category_' + i);
        categoryNames['category_' + i] = 'Category ' + i;
    }

    const display = document.getElementById('categoryInputsDisplay');
    if (display) {
        let html = '<h5>Enter Category Names</h5><div class="row">';
        for (let i = 0; i < categories.length; i++) {
            const catKey = categories[i];
            html += '<div class="col-md-6 mb-3">';
            html += '<label class="form-label">Category ' + (i+1) + ':</label>';
            html += '<input type="text" id="categoryName' + i + '" class="form-control" value="' + categoryNames[catKey] + '">';
            html += '</div>';
        }
        html += '</div><button class="btn btn-success mt-3" onclick="saveCategoryNames()">Save Category Names</button>';
        display.innerHTML = html;
    }
}

// SAVE CATEGORY NAMES
function saveCategoryNames() {
    for (let i = 0; i < categories.length; i++) {
        const catKey = categories[i];
        const input = document.getElementById('categoryName' + i);
        if (input && input.value.trim()) {
            categoryNames[catKey] = input.value.trim();
        }
    }
    for (let i = 0; i < categories.length; i++) {
        if (!scoresData[categories[i]]) {
            scoresData[categories[i]] = [];
        }
    }
    alert('Category names saved!');
}

// SETUP JUDGES
function setupJudges() {
    const numInput = document.getElementById('numJudges');
    if (!numInput) { alert('Error: numJudges element not found'); return; }
    
    const num = parseInt(numInput.value);
    if (isNaN(num) || num < 1) { alert('Please enter a valid number of judges'); return; }

    judges = [];
    for (let i = 1; i <= num; i++) {
        judges.push(i);
    }

    const display = document.getElementById('judgeListDisplay');
    if (display) {
        display.innerHTML = 'Judges created: ' + num;
    }

    generateScoreTables();
}

// GENERATE SCORE TABLES
function generateScoreTables() {
    const scoreTableSection = document.getElementById('scoreTableSection');
    const scoreTableContainer = document.getElementById('scoreTableContainer');
    
    if (!scoreTableSection || !scoreTableContainer) { return; }

    if (!contestants || contestants.length === 0) { alert('Please create contestants first'); return; }
    if (!categories || categories.length === 0) { alert('Please create categories first'); return; }
    if (!judges || judges.length === 0) { alert('Please create judges first'); return; }

    let html = '';

    for (let cat = 0; cat < categories.length; cat++) {
        const category = categories[cat];
        const categoryName = categoryNames[category];

        html += '<div class="card mb-4">';
        html += '<div class="card-header bg-info text-white">';
        html += '<h5 class="mb-0">' + categoryName + '</h5>';
        html += '</div>';
        html += '<div class="card-body"><div class="table-responsive"><table class="table table-bordered">';
        html += '<thead><tr><th>Contestant</th>';

        for (let j = 0; j < judges.length; j++) {
            html += '<th>Judge ' + judges[j] + '</th>';
        }

        html += '</tr></thead><tbody>';

        for (let c = 0; c < contestants.length; c++) {
            const contestantNum = contestants[c];
            html += '<tr><td><strong>Contestant ' + contestantNum + '</strong></td>';

            for (let j = 0; j < judges.length; j++) {
                const judgeNum = judges[j];
                const inputId = 'score_' + category + '_' + contestantNum + '_' + judgeNum;
                html += '<td><input type="number" id="' + inputId + '" class="form-control" min="1" max="1000" value=""></td>';
            }

            html += '</tr>';
        }

        html += '</tbody></table></div>';
        html += '<button class="btn btn-success mt-2" onclick="saveScoresForCategory(\'' + category + '\')">Save ' + categoryName + '</button>';
        html += '</div></div>';
    }

    scoreTableContainer.innerHTML = html;
    scoreTableSection.style.display = 'block';
}

// SAVE SCORES FOR CATEGORY
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
}

// LOAD DEMO DATA
// LOAD DEMO DATA FROM example.json
function loadDemoData() {
    if (!confirm('Load demo data? This will replace current setup.')) return;
    
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
            
            // Initialize scores data
            scoresData = {};
            for (let i = 0; i < categories.length; i++) {
                scoresData[categories[i]] = [];
            }
            
            // Load scores
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
            
            // Update displays
            document.getElementById('contestantListDisplay').innerHTML = 'Contestants loaded: ' + contestants.length;
            document.getElementById('judgeListDisplay').innerHTML = 'Judges loaded: ' + judges.length;
            
            let catHtml = '<h5>Categories Loaded</h5><ul>';
            for (let i = 0; i < categories.length; i++) {
                catHtml += '<li>' + categoryNames[categories[i]] + '</li>';
            }
            catHtml += '</ul>';
            document.getElementById('categoryInputsDisplay').innerHTML = catHtml;

            generateScoreTables();
            alert('Demo data loaded! Scroll down to enter scores.');
        })
        .catch(error => {
            alert('Error loading demo data: ' + error.message);
            console.error(error);
        });
}

// GET ADJUSTED SCORES
function getAdjustedScores(scores) {
    if (scores.length <= 2) return scores;
    const sorted = scores.slice().sort((a, b) => a - b);
    return sorted.slice(1, -1);
}

// CALCULATE FINAL SCORES
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
        const categoryTotals = {};
        const categoryAverages = {};

        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            let adjustedScores = contestantScores[contestantNum][category].slice();
            
            if (dropOutliers && adjustedScores.length > 0) {
                adjustedScores = getAdjustedScores(adjustedScores);
            }

            let categoryTotal = 0;
            for (let j = 0; j < adjustedScores.length; j++) {
                categoryTotal += adjustedScores[j];
            }
            
            categoryTotals[category] = categoryTotal;
            categoryAverages[category] = adjustedScores.length > 0 ? (categoryTotal / adjustedScores.length).toFixed(2) : '0.00';
            
            for (let j = 0; j < adjustedScores.length; j++) {
                allScores.push(adjustedScores[j]);
            }
        }

        if (allScores.length === 0) continue;

        let total = 0;
        for (let i = 0; i < allScores.length; i++) {
            total += allScores[i];
        }
        
        results.push({
            contestantNumber: contestantNum,
            average: (total / allScores.length).toFixed(2),
            total: total.toFixed(2),
            categoryTotals: categoryTotals,
            categoryAverages: categoryAverages
        });
    }

    results.sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
    displayFinalScores(results);
}

// DISPLAY FINAL SCORES
function displayFinalScores(results) {
    const display = document.getElementById('finalScoresDisplay');
    let html = '';
    
    if (dropOutliers) {
        html += '<p><em>Outliers Removed</em></p>';
    }

    html += '<div class="card mb-3"><div class="card-header bg-success text-white"><h5>Winners</h5></div><div class="card-body">';
    
    const rankLabels = ['WINNER', '1ST ALTERNATE', '2ND ALTERNATE'];
    for (let i = 0; i < Math.min(3, results.length); i++) {
        const r = results[i];
        html += '<p><strong>' + rankLabels[i] + ':</strong> Contestant ' + r.contestantNumber + ' - Total: ' + r.total + '</p>';
    }

    html += '</div></div>';

    html += '<div class="card mb-3"><div class="card-header bg-info text-white"><h5>Category Winners</h5></div><div class="card-body">';
    
    for (let catIdx = 0; catIdx < categories.length; catIdx++) {
        const cat = categories[catIdx];
        let max = -Infinity, winner = null;
        for (let i = 0; i < results.length; i++) {
            const catTotal = results[i].categoryTotals[cat] || 0;
            if (catTotal > max) {
                max = catTotal;
                winner = results[i].contestantNumber;
            }
        }
        html += '<p><strong>' + categoryNames[cat] + ':</strong> Contestant ' + winner + ' (' + max.toFixed(2) + ')</p>';
    }

    html += '</div></div>';

    html += '<div class="card"><div class="card-header bg-primary text-white"><h5>All Results</h5></div><div class="card-body">';
    
    for (let i = 0; i < results.length; i++) {
        const r = results[i];
        const rankLabel = i < 3 ? rankLabels[i] : 'Rank ' + (i + 1);
        html += '<h6 class="mt-3">' + rankLabel + ' - Contestant ' + r.contestantNumber + '</h6>';
        html += '<p><strong>Total:</strong> ' + r.total + ' | <strong>Average:</strong> ' + r.average + '</p>';
        html += '<table class="table table-sm"><thead><tr><th>Category</th><th>Total</th><th>Average</th></tr></thead><tbody>';
        
        for (let catIdx = 0; catIdx < categories.length; catIdx++) {
            const cat = categories[catIdx];
            html += '<tr><td>' + categoryNames[cat] + '</td><td>' + r.categoryTotals[cat].toFixed(2) + '</td><td>' + r.categoryAverages[cat] + '</td></tr>';
        }
        
        html += '</tbody></table>';
    }

    html += '</div></div>';
    display.innerHTML = html;
}

// EXPORT TO EXCEL
async function exportToExcel() {
    if (Object.keys(scoresData).length === 0) {
        alert('No scores to export.');
        return;
    }
    
    try {
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
        const wb = XLSX.utils.book_new();

        const winnersData = [
            ['PAGEANT RESULTS'],
            [''],
            ['RANK', 'CONTESTANT', 'TOTAL SCORE']
        ];

        const cScores = {};
        for (let i = 0; i < contestants.length; i++) {
            cScores[contestants[i]] = {};
            for (let c = 0; c < categories.length; c++) {
                cScores[contestants[i]][categories[c]] = [];
            }
        }

        for (let c = 0; c < categories.length; c++) {
            const cat = categories[c];
            for (let i = 0; i < scoresData[cat].length; i++) {
                const item = scoresData[cat][i];
                if (cScores[item.contestantNumber]) {
                    cScores[item.contestantNumber][cat].push(item.score);
                }
            }
        }

        const results = [];
        for (const cNum in cScores) {
            let all = [];
            const catTotals = {};
            for (let i = 0; i < categories.length; i++) {
                const cat = categories[i];
                let adj = cScores[cNum][cat].slice();
                if (dropOutliers && adj.length > 0) adj = getAdjustedScores(adj);
                const tot = adj.reduce((s, v) => s + v, 0);
                catTotals[cat] = tot;
                all.push(...adj);
            }
            if (all.length === 0) continue;
            const tot = all.reduce((s, v) => s + v, 0);
            results.push({
                c: parseInt(cNum),
                total: tot.toFixed(2),
                catTotals: catTotals
            });
        }

        results.sort((a, b) => parseFloat(b.total) - parseFloat(a.total));

        for (let i = 0; i < Math.min(3, results.length); i++) {
            const ranks = ['WINNER', '1ST ALTERNATE', '2ND ALTERNATE'];
            winnersData.push([ranks[i], 'Contestant ' + results[i].c, results[i].total]);
        }

        const ws1 = XLSX.utils.aoa_to_sheet(winnersData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Winners');

        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, 'pageant-results-' + timestamp + '.xlsx');
        
        alert('Excel file exported!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// DOWNLOAD TEMPLATE
async function downloadBlankTemplate() {
    if (!categories.length || !judges.length || !contestants.length) {
        alert('Complete setup first');
        return;
    }
    
    try {
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
        const wb = XLSX.utils.book_new();
        const templateData = [];

        templateData.push(['SCORE ENTRY TEMPLATE']);
        templateData.push(['Fill in scores and upload']);
        templateData.push(['']);

        for (let cat = 0; cat < categories.length; cat++) {
            const category = categories[cat];
            templateData.push([categoryNames[category]]);

            const headers = ['Contestant'];
            for (let j = 0; j < judges.length; j++) {
                headers.push('Judge ' + judges[j]);
            }
            templateData.push(headers);

            for (let c = 0; c < contestants.length; c++) {
                const row = ['Contestant ' + contestants[c]];
                for (let j = 0; j < judges.length; j++) {
                    row.push('');
                }
                templateData.push(row);
            }
            templateData.push(['']);
        }

        const ws = XLSX.utils.aoa_to_sheet(templateData);
        XLSX.utils.book_append_sheet(wb, ws, 'Scores');

        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, 'pageant-template-' + timestamp + '.xlsx');
        alert('Template downloaded!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// IMPORT TEMPLATE
async function importFromTemplate() {
    if (!categories.length) {
        alert('Complete setup first');
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(sheet, {header: 1});

                    let currentCat = null;
                    let imported = 0;

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        if (!row || !row[0]) continue;

                        const first = String(row[0]).trim();
                        
                        let found = false;
                        for (let catIdx = 0; catIdx < categories.length; catIdx++) {
                            if (categoryNames[categories[catIdx]] === first) {
                                currentCat = categories[catIdx];
                                found = true;
                                break;
                            }
                        }
                        if (found) continue;

                        if (first.toLowerCase().includes('contestant')) {
                            if (!currentCat) continue;
                            const num = parseInt(first.replace(/[^0-9]/g, ''));
                            if (isNaN(num)) continue;

                            if (!scoresData[currentCat]) scoresData[currentCat] = [];

                            for (let j = 1; j < row.length && j <= judges.length; j++) {
                                const score = parseFloat(row[j]);
                                if (!isNaN(score) && score >= 1 && score <= 1000) {
                                    scoresData[currentCat].push({
                                        contestantNumber: num,
                                        judgeNumber: judges[j-1],
                                        score: score
                                    });
                                    imported++;
                                }
                            }
                        }
                    }

                    alert('Imported ' + imported + ' scores!');
                    generateScoreTables();
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };
    input.click();
}

// TOGGLE OUTLIERS
function toggleOutliers() {
    dropOutliers = document.getElementById('outlierToggle').checked;
}

// CLEAR ALL DATA
function clearAllData() {
    if (!confirm('Clear all data? Cannot be undone!')) return;
    contestants = [];
    contestantNames = {};
    judges = [];
    categories = [];
    categoryNames = {};
    scoresData = {};
    dropOutliers = false;

    document.getElementById('contestantListDisplay').innerHTML = '';
    document.getElementById('categoryInputsDisplay').innerHTML = '';
    document.getElementById('judgeListDisplay').innerHTML = '';
    document.getElementById('scoreTableSection').style.display = 'none';
    document.getElementById('scoreTableContainer').innerHTML = '';
    document.getElementById('finalScoresDisplay').innerHTML = '';
    document.getElementById('numContestants').value = '';
    document.getElementById('numCategories').value = '';
    document.getElementById('numJudges').value = '';
    
    alert('All data cleared!');
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('createContestantBtn').addEventListener('click', setupContestants);
    document.getElementById('createCategoryBtn').addEventListener('click', setupCategories);
    document.getElementById('createJudgeBtn').addEventListener('click', setupJudges);
    document.getElementById('calculateBtn').addEventListener('click', calculateFinalScores);
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    document.getElementById('downloadTemplateBtn').addEventListener('click', downloadBlankTemplate);
    document.getElementById('importTemplateBtn').addEventListener('click', importFromTemplate);
    document.getElementById('clearBtn').addEventListener('click', clearAllData);
    document.getElementById('demoBtn').addEventListener('click', loadDemoData);
    document.getElementById('outlierToggle').addEventListener('change', toggleOutliers);
});
//This where all the excel functions live



// Export results


async function exportToExcel() {
    if (Object.keys(scoresData).length === 0) {
        alert('No scores to export. Please calculate final scores first.');
        return;
    }
    
    try {
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
        
        // Calculate full results like on the webpage
        const results = calculateFullResults();
        
        const wb = XLSX.utils.book_new();
        
        // ============= SHEET 1: WINNERS & SUMMARY =============
        const winnersData = [];
        winnersData.push(['PAGEANT RESULTS - WINNERS & SUMMARY']);
        winnersData.push(['Date: ' + new Date().toLocaleDateString()]);
        winnersData.push(['Outliers Removed: ' + (dropOutliers ? 'Yes (Highest and Lowest scores per category)' : 'No')]);
        winnersData.push(['']);
        
        winnersData.push(['TOP 3 OVERALL WINNERS']);
        winnersData.push(['RANK', 'CONTESTANT #', 'TOTAL SCORE', 'AVERAGE', 'STATUS']);
        
        results.slice(0, 3).forEach((result, idx) => {
            const status = idx === 0 ? 'WINNER 🏆' : idx === 1 ? '1ST ALTERNATE 🥈' : '2ND ALTERNATE 🥉';
            winnersData.push([
                idx + 1, 
                'Contestant #' + result.contestantNumber, 
                result.total, 
                result.average,
                status
            ]);
        });
        
        winnersData.push(['']);
        winnersData.push(['CATEGORY WINNERS (By Total Score)']);
        winnersData.push(['CATEGORY', 'WINNER', 'TOTAL SCORE']);
        
        categories.forEach(category => {
            const categoryName = categoryNames[category];
            let maxScore = -1;
            let winner = null;
            
            results.forEach(result => {
                const catTotal = result.categoryTotals[category] || 0;
                if (catTotal > maxScore) {
                    maxScore = catTotal;
                    winner = result.contestantNumber;
                }
            });
            
            winnersData.push([categoryName, 'Contestant #' + winner, maxScore.toFixed(2)]);
        });
        
        const ws1 = XLSX.utils.aoa_to_sheet(winnersData);
        ws1['!cols'] = [{ width: 15 }, { width: 20 }, { width: 15 }, { width: 12 }, { width: 25 }];
        
        // ============= SHEET 2: DETAILED BREAKDOWN BY CONTESTANT =============
        const detailedData = [];
        detailedData.push(['DETAILED BREAKDOWN BY CONTESTANT']);
        detailedData.push(['']);
        
        const rankLabels = ['WINNER', '1ST ALTERNATE', '2ND ALTERNATE'];
        
        results.forEach((result, idx) => {
            const rankLabel = rankLabels[idx] || 'Rank #' + (idx + 1);
            
            detailedData.push([rankLabel + ' - Contestant #' + result.contestantNumber]);
            detailedData.push(['']);
            
            // Category Breakdown
            detailedData.push(['CATEGORY BREAKDOWN' + (dropOutliers ? ' (outliers removed)' : '')]);
            detailedData.push(['Category', 'Total Score', 'Average Score']);
            
            categories.forEach(category => {
                const categoryName = categoryNames[category];
                const totalCategoryScore = result.categoryTotals[category] || 0;
                const categoryAverage = result.categoryAverages[category];
                
                detailedData.push([
                    categoryName,
                    totalCategoryScore.toFixed(2),
                    categoryAverage
                ]);
            });
            
            detailedData.push(['']);
            detailedData.push(['TOTAL ALL SCORES', result.total]);
            detailedData.push(['OVERALL AVERAGE', result.average]);
            detailedData.push(['']);
            detailedData.push(['']);
        });
        
        const ws2 = XLSX.utils.aoa_to_sheet(detailedData);
        ws2['!cols'] = [{ width: 25 }, { width: 15 }, { width: 15 }];
        
        // ============= SHEET 3: JUDGE AVERAGES PER CONTESTANT =============
        const judgeAvgData = [];
        judgeAvgData.push(['JUDGE OVERALL AVERAGES PER CONTESTANT']);
        judgeAvgData.push(['']);
        
        const judgeHeaders = ['Contestant #'];
        judges.forEach(j => judgeHeaders.push('Judge #' + j));
        judgeHeaders.push('Overall Judge Avg');
        judgeAvgData.push(judgeHeaders);
        
        results.forEach(result => {
            const judgeAverages = {};
            
            // Calculate judge averages for this contestant
            categories.forEach(category => {
                if (!scoresData[category]) return;
                scoresData[category].forEach(scoreItem => {
                    if (scoreItem.contestantNumber == result.contestantNumber) {
                        if (!judgeAverages[scoreItem.judgeNumber]) {
                            judgeAverages[scoreItem.judgeNumber] = [];
                        }
                        judgeAverages[scoreItem.judgeNumber].push(scoreItem.score);
                    }
                });
            });
            
            const row = ['Contestant #' + result.contestantNumber];
            let allJudgeScores = [];
            
            judges.forEach(judgeNum => {
                if (judgeAverages[judgeNum] && judgeAverages[judgeNum].length > 0) {
                    const judgeTotal = judgeAverages[judgeNum].reduce((sum, score) => sum + score, 0);
                    const judgeAvg = (judgeTotal / judgeAverages[judgeNum].length).toFixed(2);
                    row.push(judgeAvg);
                    allJudgeScores.push(...judgeAverages[judgeNum]);
                } else {
                    row.push('-');
                }
            });
            
            // Overall judge average
            if (allJudgeScores.length > 0) {
                const totalJudgeScores = allJudgeScores.reduce((sum, score) => sum + score, 0);
                const judgeOverallAvg = (totalJudgeScores / allJudgeScores.length).toFixed(2);
                row.push(judgeOverallAvg);
            } else {
                row.push('-');
            }
            
            judgeAvgData.push(row);
        });
        
        const ws3 = XLSX.utils.aoa_to_sheet(judgeAvgData);
        ws3['!cols'] = [
            { width: 18 },
            ...judges.map(() => ({ width: 12 })),
            { width: 18 }
        ];
        
        // ============= SHEET 4: RAW SCORES - ALL CATEGORIES ON ONE PAGE =============
        const rawData = [];
        rawData.push(['RAW SCORES - ALL CATEGORIES']);
        rawData.push(['']);
        
        categories.forEach((category, catIndex) => {
            const categoryName = categoryNames[category];
            
            // Category header
            rawData.push([categoryName]);
            
            // Table header: Contestant # | Judge #1 | Judge #2 | Judge #3 | etc.
            const categoryHeaders = ['Contestant #'];
            judges.forEach(j => categoryHeaders.push('Judge #' + j));
            rawData.push(categoryHeaders);
            
            // Rows for each contestant
            contestants.forEach(contestantNum => {
                const row = ['Contestant #' + contestantNum];
                
                judges.forEach(judgeNum => {
                    let score = '';
                    
                    if (scoresData[category]) {
                        const scoreItem = scoresData[category].find(s => 
                            s.contestantNumber === contestantNum && 
                            s.judgeNumber === judgeNum
                        );
                        if (scoreItem) {
                            score = scoreItem.score;
                        }
                    }
                    
                    row.push(score);
                });
                
                rawData.push(row);
            });
            
            // Add spacing between tables
            rawData.push(['']);
            rawData.push(['']);
        });
        
        const ws4 = XLSX.utils.aoa_to_sheet(rawData);
        ws4['!cols'] = [
            { width: 18 },
            ...judges.map(() => ({ width: 12 }))
        ];
        
        // ============= SHEET 5: ALL RAW SCORES (FLAT) =============
        const flatRawData = [];
        flatRawData.push(['ALL RAW SCORES']);
        flatRawData.push(['']);
        flatRawData.push(['CONTESTANT #', 'CATEGORY', 'JUDGE #', 'SCORE']);
        
        contestants.forEach(contestantNum => {
            categories.forEach(category => {
                const categoryName = categoryNames[category];
                const categoryScores = scoresData[category] || [];
                
                categoryScores.forEach(scoreItem => {
                    if (scoreItem.contestantNumber === contestantNum) {
                        flatRawData.push([
                            'Contestant #' + contestantNum,
                            categoryName,
                            'Judge #' + scoreItem.judgeNumber,
                            scoreItem.score
                        ]);
                    }
                });
            });
        });
        
        const ws5 = XLSX.utils.aoa_to_sheet(flatRawData);
        ws5['!cols'] = [{ width: 18 }, { width: 20 }, { width: 12 }, { width: 10 }];
        
        // ============= SHEET 6: SUMMARY STATISTICS =============
        const statsData = [];
        statsData.push(['SUMMARY STATISTICS']);
        statsData.push(['']);
        
        statsData.push(['OVERALL STATISTICS']);
        statsData.push(['Total Contestants', results.length]);
        statsData.push(['Total Judges', judges.length]);
        statsData.push(['Total Categories', categories.length]);
        statsData.push(['']);
        
        statsData.push(['SCORE STATISTICS']);
        const totalScores = results.map(r => parseFloat(r.total));
        statsData.push(['Highest Total Score', Math.max(...totalScores).toFixed(2)]);
        statsData.push(['Lowest Total Score', Math.min(...totalScores).toFixed(2)]);
        statsData.push(['Average Total Score', (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(2)]);
        statsData.push(['']);
        
        statsData.push(['CATEGORY STATISTICS']);
        categories.forEach(category => {
            const categoryName = categoryNames[category];
            const categoryTotals = results.map(r => r.categoryTotals[category]);
            
            statsData.push([categoryName + ' - Highest', Math.max(...categoryTotals).toFixed(2)]);
            statsData.push([categoryName + ' - Lowest', Math.min(...categoryTotals).toFixed(2)]);
            statsData.push([categoryName + ' - Average', (categoryTotals.reduce((a, b) => a + b, 0) / categoryTotals.length).toFixed(2)]);
            statsData.push(['']);
        });
        
        const ws6 = XLSX.utils.aoa_to_sheet(statsData);
        ws6['!cols'] = [{ width: 30 }, { width: 15 }];
        
        // Add all sheets to workbook
        XLSX.utils.book_append_sheet(wb, ws1, 'Winners & Summary');
        XLSX.utils.book_append_sheet(wb, ws2, 'Detailed Breakdown');
        XLSX.utils.book_append_sheet(wb, ws3, 'Judge Averages');
        XLSX.utils.book_append_sheet(wb, ws4, 'Scores by Category');
        XLSX.utils.book_append_sheet(wb, ws5, 'All Raw Scores');
        XLSX.utils.book_append_sheet(wb, ws6, 'Statistics');
        
        // Generate and download
        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, 'pageant-complete-results-' + timestamp + '.xlsx');
        
        alert('Complete Excel file exported successfully with 6 sheets!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting to Excel: ' + error.message);
    }
}


// Download Blank Template for Score Entry
async function downloadBlankTemplate() {
    if (!categories || categories.length === 0) {
        alert('Please set up categories first (Step 3)');
        return;
    }
    if (!judges || judges.length === 0) {
        alert('Please set up judges first (Step 2)');
        return;
    }
    if (!contestants || contestants.length === 0) {
        alert('Please set up contestants first (Step 1)');
        return;
    }
    
    try {
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
        const wb = XLSX.utils.book_new();

        // ============= INSTRUCTIONS SHEET =============
        const instructionsData = [];
        instructionsData.push(['PAGEANT SCORE TEMPLATE - INSTRUCTIONS']);
        instructionsData.push(['']);
        instructionsData.push(['HOW TO USE THIS TEMPLATE:']);
        instructionsData.push(['']);
        instructionsData.push(['1. Go to the "Score Entry" sheet (click the tab at the bottom)']);
        instructionsData.push(['2. Fill in scores for each contestant under each judge column']);
        instructionsData.push(['3. Each category has its own table - scroll down to see all categories']);
        instructionsData.push(['4. Enter scores between 1 and 1000']);
        instructionsData.push(['5. Leave cells blank if no score (do NOT enter 0)']);
        instructionsData.push(['6. Save the file when done']);
        instructionsData.push(['7. IMPORTANT: DELETE this "Instructions" sheet before importing!']);
        instructionsData.push(['   (Right-click the sheet tab → Delete)']);
        instructionsData.push(['8. Use the "Import from Template" button in the calculator to upload this file']);
        instructionsData.push(['']);
        instructionsData.push(['SETUP INFORMATION:']);
        instructionsData.push(['Number of Contestants:', contestants.length]);
        instructionsData.push(['Number of Judges:', judges.length]);
        instructionsData.push(['Number of Categories:', categories.length]);
        instructionsData.push(['']);
        instructionsData.push(['CATEGORIES:']);

        // FIXED: properly loop through categories
        categories.forEach((category, idx) => {
            instructionsData.push([`${idx + 1}. ${categoryNames[category]}`]);
        });

        const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
        wsInstructions['!cols'] = [{ width: 40 }, { width: 20 }];

        // ============= SCORE ENTRY SHEET =============
        const templateData = [];
        templateData.push(['SCORE ENTRY TEMPLATE']);
        templateData.push(['Fill in scores below - Leave blank cells empty, do not use 0']);
        templateData.push(['']);

        categories.forEach((category) => {
            const categoryName = categoryNames[category];

            templateData.push([categoryName]); // category header

            // Table header: Contestant # | Judge #1 | Judge #2 | ...
            const categoryHeaders = ['Contestant #'];
            judges.forEach(j => categoryHeaders.push('Judge #' + j));
            templateData.push(categoryHeaders);

            // Blank rows for user to fill in
            contestants.forEach(contestantNum => {
                const row = ['Contestant #' + contestantNum];
                judges.forEach(() => row.push(''));
                templateData.push(row);
            });

            templateData.push(['']);
            templateData.push(['']);
        });

        const wsTemplate = XLSX.utils.aoa_to_sheet(templateData);

        // FIXED: correct column-width syntax
        wsTemplate['!cols'] = [
            { width: 18 },
            ...judges.map(() => ({ width: 12 }))
        ];

        XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
        XLSX.utils.book_append_sheet(wb, wsTemplate, 'Score Entry');

        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, 'pageant-blank-template-' + timestamp + '.xlsx');

        alert('Blank template downloaded! Fill it out and upload it back using the "Upload from Template" button.');
    } catch (error) {
        console.error('Template download error:', error);
        alert('Error downloading template: ' + error.message);
    }
}


// NEW FUNCTION: Import Scores from Filled Template
async function importFromTemplate() {
    if (!categories || categories.length === 0) {
        alert('Please set up categories, judges, and contestants first');
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
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Read the "Score Entry" sheet
                    const sheetName = 'Score Entry';
                    if (!workbook.SheetNames.includes(sheetName)) {
                        alert('Could not find "Score Entry" sheet. Please use the correct template.');
                        return;
                    }
                    
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    let importedCount = 0;
                    let currentCategory = null;
                    let currentCategoryIndex = -1;
                    
                    // Parse the data
                    for (let i = 0; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (!row || row.length === 0) continue;
                        
                        const firstCell = String(row[0] || '').trim();
                        
                        // Check if this is a category header
                        let foundCategory = false;
                        for (let c = 0; c < categories.length; c++) {
                            if (categoryNames[categories[c]] === firstCell) {
                                currentCategory = categories[c];
                                currentCategoryIndex = c;
                                foundCategory = true;
                                break;
                            }
                        }
                        
                        if (foundCategory) continue;
                        
                        // Check if this is a contestant row
                        if (firstCell.includes('Contestant #')) {
                            if (currentCategory === null) continue;
                            
                            const contestantNum = parseInt(firstCell.replace('Contestant #', '').trim());
                            if (isNaN(contestantNum)) continue;
                            
                            // Read scores from this row
                            for (let j = 1; j < row.length && j <= judges.length; j++) {
                                const score = parseFloat(row[j]);
                                
                                if (!isNaN(score) && score >= 1 && score <= 1000) {
                                    const judgeNum = judges[j - 1];
                                    
                                    if (!scoresData[currentCategory]) {
                                        scoresData[currentCategory] = [];
                                    }
                                    
                                    // Remove any existing score for this contestant/judge/category
                                    scoresData[currentCategory] = scoresData[currentCategory].filter(s => 
                                        !(s.contestantNumber === contestantNum && s.judgeNumber === judgeNum)
                                    );
                                    
                                    // Add the new score
                                    scoresData[currentCategory].push({
                                        contestantNumber: contestantNum,
                                        judgeNumber: judgeNum,
                                        score: score
                                    });
                                    
                                    importedCount++;
                                }
                            }
                        }
                    }
                    
                    if (importedCount === 0) {
                        alert('No valid scores found in the template. Please check the format.');
                        return;
                    }
                    
                    saveToStorage();
                    populateScoreTables();
                    
                    alert(`Successfully imported ${importedCount} scores from template!\n\nScroll down to see the scores in the tables, then click "Calculate Final Scores".`);
                    
                } catch (error) {
                    console.error('Parse error:', error);
                    alert('Error reading template file: ' + error.message);
                }
            };
            
            reader.readAsArrayBuffer(file);
            
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing template: ' + error.message);
        }
    };
    
    input.click();
}

//export scores to spreadsheet
function calculateResultsForExport() {
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
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            let adjustedScores = contestantScores[contestantNum][category].slice();
            if (dropOutliers && adjustedScores.length > 2) {
                adjustedScores = getAdjustedScores(adjustedScores);
            }
            let categoryTotal = 0;
            for (let j = 0; j < adjustedScores.length; j++) {
                categoryTotal += adjustedScores[j];
                allScores.push(adjustedScores[j]);
            }
            categoryTotals[category] = categoryTotal;
        }
        if (allScores.length === 0) continue;
        let total = 0;
        for (let i = 0; i < allScores.length; i++) {
            total += allScores[i];
        }
        results.push({
            contestantNumber: contestantNum,
            total: total.toFixed(2),
            categoryTotals: categoryTotals
        });
    }
    results.sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
    return results;
}

//download your blank score sheet
function downloadBlankScores() {
    if (!categories || categories.length === 0) {
        alert('Please set up categories first');
        return;
    }

    let csv = 'Contestant#';

    for (let j = 0; j < judges.length; j++) {
        csv += ',Judge\'s Score #' + judges[j];
    }
    csv += '\n';

    csv += 'Category: ';
    for (let c = 0; c < categories.length; c++) {
        if (c === 0) {
            csv += categoryNames[categories[c]];
        }
    }
    csv += '\n';

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

//download your filled score sheet
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

    for (let j = 0; j < judges.length; j++) {
        csv += ',Judge\'s Score #' + judges[j];
    }
    csv += '\n';

    csv += 'Category: ' + categoryNames[categoryKey] + '\n';

    for (let con = 0; con < contestants.length; con++) {
        const contestantNum = contestants[con];
        csv += 'Contestant#' + contestantNum;

        for (let j = 0; j < judges.length; j++) {
            const judgeNum = judges[j];
            
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

//import scores filled out template
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
                
                const isSpreadsheetFormat = header[0].toLowerCase().includes('contestant') && 
                                           header[1] && header[1].toLowerCase().includes('judge');
                
                let importedCount = 0;
                
                if (isSpreadsheetFormat) {
                    for (let i = 2; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;
                        
                        const parts = line.split(',');
                        if (parts.length < 2) continue;
                        
                        const contestantStr = parts[0].trim();
                        const contestantNum = parseInt(contestantStr.replace('Contestant#', ''));
                        
                        if (isNaN(contestantNum)) continue;
                        
                        for (let j = 1; j < parts.length; j++) {
                            const score = parseFloat(parts[j].trim());
                            
                            if (!isNaN(score) && score >= 1 && score <= 1000) {
                                const judgeNum = j;
                                
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
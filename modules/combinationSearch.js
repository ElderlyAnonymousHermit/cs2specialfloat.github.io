// ========== 组合搜索功能 ==========
let isSearching = false;
let foundCombinations = [];
let currentSearchId = null;
const MAX_RESULTS = 100;
const BATCH_SIZE = 10000; // 增加批处理大小

// 优化：预计算和缓存
let cachedPercentages = [];
let cachedWearRange = 0;
function findCombinations() {
    if (isSearching) {
        alert('搜索正在进行中，请等待完成或停止当前搜索');
        return;
    }
    
    clearResults();
    
    const combinationCount = parseInt(document.getElementById('combinationCount').value);
    const productMinWear = parseFloat(document.getElementById('productMinWear').value) || 0;
    const productMaxWear = parseFloat(document.getElementById('productMaxWear').value) || 1;
    const targetProductWear = parseFloat(document.getElementById('targetProductWear').value);
    const significantDigits = parseInt(document.getElementById('significantDigits').value);
    
    if (productMinWear >= productMaxWear) {
        alert('产物最大磨损必须大于最小磨损！');
        return;
    }
    
    if (targetProductWear < productMinWear || targetProductWear > productMaxWear) {
        alert('期望产物磨损必须在产物磨损范围内！');
        return;
    }
    
    const availablePercentages = getAllAvailablePercentages();
    if (availablePercentages.length < combinationCount) {
        alert(`可用材料数量不足！需要 ${combinationCount} 个，当前只有 ${availablePercentages.length} 个`);
        return;
    }
    
    isSearching = true;
    foundCombinations = [];
    currentSearchId = Date.now();
    
    document.getElementById('searchResults').style.display = 'block';
    updateResultsCount();
    
    document.querySelector('.btn-search').disabled = true;
    
    // 预计算和缓存
    cachedPercentages = availablePercentages;
    
    console.log(`开始优化搜索: ${availablePercentages.length} 个材料中选取 ${combinationCount} 个`);
    
    setTimeout(() => {
        performOptimizedCombinationSearch(
            availablePercentages,
            combinationCount,
            productMinWear,
            productMaxWear,
            targetProductWear,
            significantDigits,
            currentSearchId
        );
    }, 100);
}

function performOptimizedCombinationSearch(percentages, count, minWear, maxWear, targetWear, digits, searchId) {
    const totalCombinations = combinations(percentages.length, count);
    let checkedCombinations = 0;
    let batchResults = [];
    
    console.log(`优化搜索开始: 总共 ${totalCombinations.toLocaleString()} 种组合`);
    
    // 预计算常量并确保IEEE754精度
    const wearRange = IEEE754Float32.ensureFloat32(
        IEEE754Float32.subtract(maxWear, minWear)
    );
    const targetWearFloat = IEEE754Float32.ensureFloat32(targetWear);
    const minWearFloat = IEEE754Float32.ensureFloat32(minWear);
    
    cachedWearRange = wearRange;
    
    // 创建进度条
    createProgressBar();
    
    // 优化：使用更高效的组合生成器
    function* optimizedCombinationGenerator(arr, k) {
        const n = arr.length;
        const indices = Array(k).fill(0).map((_, i) => i);
        
        yield indices.map(i => arr[i]);
        
        while (true) {
            let i = k - 1;
            while (i >= 0 && indices[i] === n - k + i) {
                i--;
            }
            if (i < 0) break;
            
            indices[i]++;
            for (let j = i + 1; j < k; j++) {
                indices[j] = indices[j - 1] + 1;
            }
            
            yield indices.map(idx => arr[idx]);
        }
    }
    
    // 优化：批量处理函数 - 确保所有计算使用IEEE754
 // 优化：批量处理函数 - 使用新的符合位数匹配
    function processBatch(combinationsBatch) {
        const batchMatches = [];
        
        for (const combination of combinationsBatch) {
            if (!isSearching || searchId !== currentSearchId) {
                return [];
            }
            
            checkedCombinations++;
            
            // 使用IEEE754精度计算
            let sum = IEEE754Float32.ensureFloat32(0);
            for (const percent of combination) {
                sum = IEEE754Float32.add(sum, percent.value);
            }
            const averagePercent = IEEE754Float32.divide(sum, count);
            
            const productWear = IEEE754Float32.add(
                IEEE754Float32.multiply(averagePercent, wearRange),
                minWearFloat
            );
            
            // 使用新的符合位数匹配
            if (IEEE754Float32.isMatchWithConformingDigits(productWear, targetWearFloat, digits)) {
                batchMatches.push({
                    materials: combination,
                    productWear: productWear,
                    averagePercent: averagePercent,
                    // 添加调试信息
                    debug: {
                        actual: productWear,
                        target: targetWearFloat,
                        conformingActual: IEEE754Float32.getConformingDigits(productWear, digits),
                        conformingTarget: IEEE754Float32.getConformingDigits(targetWearFloat, digits)
                    }
                });
                
                if (foundCombinations.length + batchMatches.length >= MAX_RESULTS) {
                    return batchMatches;
                }
            }
        }
        
        return batchMatches;
    }
    
    function processInBatches() {
        const generator = optimizedCombinationGenerator(percentages, count);
        let batch = [];
        
        function processNextBatch() {
            if (!isSearching || searchId !== currentSearchId) {
                finishSearch();
                return;
            }
            
            batch = [];
            for (let i = 0; i < BATCH_SIZE; i++) {
                const next = generator.next();
                if (next.done) {
                    break;
                }
                batch.push(next.value);
            }
            
            if (batch.length === 0) {
                finishSearch();
                return;
            }
            
            const batchMatches = processBatch(batch);
            batchResults = batchResults.concat(batchMatches);
            
            if (batchMatches.length > 0 || checkedCombinations % 10000 === 0) {
                updateUIWithBatchResults(batchMatches);
                batchMatches.length = 0;
            }
            
            // 更新进度条
            updateProgress(checkedCombinations, totalCombinations);
            
            if (foundCombinations.length >= MAX_RESULTS) {
                finishSearch();
                return;
            }
            
            setTimeout(processNextBatch, 0);
        }
        
        processNextBatch();
    }
    
    function updateUIWithBatchResults(batchMatches) {
        if (batchMatches.length === 0) return;
        
        foundCombinations = foundCombinations.concat(batchMatches);
        
        batchMatches.forEach(result => {
            addResultToUI(result);
        });
        updateResultsCount();
    }
    
    function finishSearch() {
        if (!isSearching || searchId !== currentSearchId) return;
        
        isSearching = false;
        document.querySelector('.btn-search').disabled = false;
        
        // 移除进度条
        removeProgressBar();
        
        const message = checkedCombinations === totalCombinations ? 
            `✅ 搜索完成！检查了 ${checkedCombinations.toLocaleString()} 个组合，找到 ${foundCombinations.length} 个符合条件的结果` :
            `⏹️ 搜索完成！检查了 ${checkedCombinations.toLocaleString()} 个组合，找到 ${foundCombinations.length} 个符合条件的结果`;
        
        alert(message);
    }
    
    processInBatches();
}

// ========== 进度条功能 ==========
function createProgressBar() {
    const resultsHeader = document.querySelector('.results-header');
    let progressElement = document.getElementById('searchProgress');
    
    if (!progressElement) {
        progressElement = document.createElement('div');
        progressElement.id = 'searchProgress';
        progressElement.className = 'search-progress';
        resultsHeader.parentNode.insertBefore(progressElement, resultsHeader.nextSibling);
    }
    
    progressElement.style.display = 'block';
    progressElement.innerHTML = `
        <div class="progress-bar-container">
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-text">🔍 搜索进度: 0% (0/0) ⏳</div>
        </div>
    `;
}

function updateProgress(checked, total) {
    const progress = total > 0 ? ((checked / total) * 100).toFixed(2) : 0;
    
    const progressElement = document.getElementById('searchProgress');
    if (!progressElement) return;
    
    const progressFill = progressElement.querySelector('.progress-fill');
    const progressText = progressElement.querySelector('.progress-text');
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    if (progressText) {
        progressText.textContent = `🔍 搜索进度: ${progress}% (${checked.toLocaleString()}/${total.toLocaleString()}) ${progress >= 100 ? '✅' : '⏳'}`;
    }
    
    // 根据进度改变颜色
    if (progress < 30) {
        progressElement.style.background = 'linear-gradient(135deg, rgba(255, 152, 0, 0.4), rgba(255, 152, 0, 0.2))';
        progressElement.style.borderColor = '#ff9800';
        progressElement.style.color = '#ff9800';
    } else if (progress < 70) {
        progressElement.style.background = 'linear-gradient(135deg, rgba(33, 150, 243, 0.4), rgba(33, 150, 243, 0.2))';
        progressElement.style.borderColor = '#2196f3';
        progressElement.style.color = '#2196f3';
    } else {
        progressElement.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.4), rgba(76, 175, 80, 0.2))';
        progressElement.style.borderColor = '#4caf50';
        progressElement.style.color = '#4caf50';
    }
}

function removeProgressBar() {
    const progressElement = document.getElementById('searchProgress');
    if (progressElement) {
        progressElement.style.display = 'none';
    }
}

function combinations(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
        result = result * (n - k + i) / i;
    }
    return Math.round(result);
}

function getAllAvailablePercentages() {
    const allPercentages = [];
    const groups = document.querySelectorAll('.material-group');
    
    groups.forEach((group) => {
        const groupId = group.dataset.groupId;
        const materialInputs = group.querySelectorAll('.material-input');
        const minWearInput = group.querySelector('.fc-min-wear');
        const maxWearInput = group.querySelector('.fc-max-wear');
        
        const minWear = parseFloat(minWearInput.value) || 0;
        const maxWear = parseFloat(maxWearInput.value) || 1;
        const range = IEEE754Float32.subtract(maxWear, minWear);
        
        if (range <= 0) return;
        
        materialInputs.forEach((input, inputIndex) => {
            const wearValue = parseFloat(input.value);
            if (wearValue > 0 && !isNaN(wearValue) && wearValue >= minWear && wearValue <= maxWear) {
                const numerator = IEEE754Float32.subtract(wearValue, minWear);
                const percentage = IEEE754Float32.divide(numerator, range);
                
                allPercentages.push({
                    groupId: parseInt(groupId),
                    inputIndex: inputIndex,
                    wearValue: wearValue,
                    value: percentage,
                    displayValue: IEEE754Float32.formatPrecise(percentage)
                });
            }
        });
    });
    
    console.log(`找到 ${allPercentages.length} 个可用材料`);
    return allPercentages;
}

function addResultToUI(result) {
    const resultsList = document.getElementById('resultsList');
    const resultId = foundCombinations.length - 1;
    
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    resultItem.id = `result_${resultId}`;
    resultItem.onclick = () => selectResult(resultId);
    
    const materialsStr = result.materials.map(m => m.displayValue).join(' + ');
    const displayStr = materialsStr.length > 1026 ? 
        materialsStr.substring(0, 1026) + '...' : materialsStr;
    
    resultItem.innerHTML = `
        <div class="result-wear">
            🎯 产物磨损: ${IEEE754Float32.formatPrecise(result.productWear)}
        </div>
        <div class="result-materials" title="${materialsStr}">
            📦 材料组合: ${displayStr}
        </div>
        <div class="result-average">
            📊 平均百分比: ${IEEE754Float32.formatPrecise(result.averagePercent)}
        </div>
        <div class="result-actions">
            <button class="btn-use" onclick="useCombination(${resultId}); event.stopPropagation();">
                ✅ 使用此组合
            </button>
        </div>
    `;
    
    resultsList.appendChild(resultItem);
    
    setTimeout(() => {
        resultItem.style.opacity = '1';
        resultItem.style.transform = 'translateY(0)';
    }, 10);
}

function selectResult(resultId) {
    document.querySelectorAll('.result-item.selected').forEach(item => {
        item.classList.remove('selected');
    });
    
    document.querySelectorAll('.material-highlight, .percentage-highlight').forEach(el => {
        el.classList.remove('material-highlight', 'percentage-highlight');
    });
    
    const resultItem = document.getElementById(`result_${resultId}`);
    if (resultItem) {
        resultItem.classList.add('selected');
        resultItem.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
    
    const result = foundCombinations[resultId];
    if (result) {
        result.materials.forEach(material => {
            // 检查材料组是否存在
            const group = document.getElementById(`materialGroup_${material.groupId}`);
            if (group) { // 只有组存在时才高亮
                const inputs = group.querySelectorAll('.material-input');
                const percentages = group.querySelectorAll('.percentage-display');
                
                if (inputs[material.inputIndex]) {
                    inputs[material.inputIndex].classList.add('material-highlight');
                }
                if (percentages[material.inputIndex]) {
                    percentages[material.inputIndex].classList.add('percentage-highlight');
                }
            }
        });
    }
}

function useCombination(resultId) {
    const result = foundCombinations[resultId];
    if (!result) return;
    
    if (!confirm(`🎯 确定要使用这组材料吗？\n使用后 ${result.materials.length} 个材料将从输入框中移除。`)) {
        return;
    }
    
    let removedCount = 0;
    result.materials.forEach(material => {
        const group = document.getElementById(`materialGroup_${material.groupId}`);
        if (group) { // 只有组存在时才操作
            const inputs = group.querySelectorAll('.material-input');
            const percentages = group.querySelectorAll('.percentage-display');
            
            if (inputs[material.inputIndex] && parseFloat(inputs[material.inputIndex].value) > 0) {
                inputs[material.inputIndex].value = '0.0000000000';
                removedCount++;
                
                inputs[material.inputIndex].style.transition = 'all 0.5s ease';
                inputs[material.inputIndex].style.background = 'rgba(244, 67, 54, 0.3)';
                setTimeout(() => {
                    inputs[material.inputIndex].style.background = '';
                }, 1000);
            }
            if (percentages[material.inputIndex]) {
                percentages[material.inputIndex].textContent = '';
            }
        }
    });
    
    addUsageHistory(result);
    calculateAllPercentages();
    
    const resultItem = document.getElementById(`result_${resultId}`);
    if (resultItem) {
        resultItem.style.transition = 'all 0.5s ease';
        resultItem.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.1))';
        resultItem.style.borderColor = '#4caf50';
        
        setTimeout(() => {
            resultItem.remove();
            foundCombinations.splice(resultId, 1);
            renumberResults();
        }, 500);
    }
    
    setTimeout(() => {
        alert(`✅ 成功移除 ${removedCount} 个材料！\n材料组合已应用。`);
    }, 600);
}

function renumberResults() {
    const resultsList = document.getElementById('resultsList');
    const items = resultsList.querySelectorAll('.result-item');
    
    items.forEach((item, index) => {
        item.id = `result_${index}`;
        const useButton = item.querySelector('.btn-use');
        if (useButton) {
            useButton.onclick = (e) => {
                useCombination(index);
                e.stopPropagation();
            };
        }
        item.onclick = () => selectResult(index);
    });
    
    updateResultsCount();
}

function stopSearch() {
    isSearching = false;
    document.querySelector('.btn-search').disabled = false;
    removeProgressBar();
    console.log('搜索已手动停止');
}

function clearResults() {
    foundCombinations = [];
    document.getElementById('resultsList').innerHTML = '';
    updateResultsCount();
    removeProgressBar();
    
    document.querySelectorAll('.material-highlight, .percentage-highlight').forEach(el => {
        el.classList.remove('material-highlight', 'percentage-highlight');
    });
}

function updateResultsCount() {
    const countText = currentLanguage === 'zh-CN' ? 
        `已找到 ${foundCombinations.length} 个组合` : 
        `Found ${foundCombinations.length} combinations`;
    document.getElementById('resultsCount').textContent = countText;
}
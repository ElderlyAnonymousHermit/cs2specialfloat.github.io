// ========== 组合搜索功能 ==========
let isSearching = false;
let foundCombinations = [];
let currentSearchId = null;
const MAX_RESULTS = 100;
const BATCH_SIZE = 10000;

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

    // 预计算常量
    const wearRange = getIEEE754(getIEEE754(maxWear) - getIEEE754(minWear));
    const targetWearFloat = getIEEE754(targetWear);
    const minWearFloat = getIEEE754(minWear);

    // 创建进度条
    createProgressBar();

    // ========== 重构的组合生成器 ==========
    // 基于第一个代码的高效算法重写
    function* optimizedCombinationGenerator(arr, k) {
        const n = arr.length;
        if (k > n) return;

        // 初始化位置数组 - 这是关键优化
        const indices = Array.from({ length: k }, (_, i) => i);

        while (true) {
            // 生成当前组合
            const combo = indices.map(i => arr[i]);
            yield combo;

            // 寻找下一个组合 - 核心优化算法
            let i = k - 1;
            while (i >= 0 && indices[i] === n - k + i) {
                i--;
            }

            if (i < 0) break; // 所有组合已生成

            indices[i]++;
            for (let j = i + 1; j < k; j++) {
                indices[j] = indices[j - 1] + 1;
            }
        }
    }

    // ========== 优化的批处理函数 ==========
    function processBatch(combinationsBatch) {
        const batchMatches = [];

        for (const combination of combinationsBatch) {
            if (!isSearching || searchId !== currentSearchId) {
                return [];
            }

            checkedCombinations++;

            // 优化的磨损计算 - 减少函数调用
            let sum = 0;
            for (const percent of combination) {
                sum = getIEEE754(sum + getIEEE754(percent.value))
            }

            // 批量IEEE754转换（减少转换次数）
            const averagePercent = getIEEE754(sum / getIEEE754(count))




            const productWear = getIEEE754(getIEEE754(averagePercent * wearRange) + minWearFloat);




            // 优化的比较逻辑 - 使用数值比较替代字符串比较
            const wearDiff = Math.abs(productWear - targetWearFloat);
            const tolerance = Math.pow(10, -digits) / 2; // 根据有效位数计算容差

            if (wearDiff <= tolerance) {
                batchMatches.push({
                    materials: combination,
                    productWear: productWear,
                    averagePercent: averagePercent,
                    wearDiff: wearDiff
                });

                if (foundCombinations.length + batchMatches.length >= MAX_RESULTS) {
                    return batchMatches;
                }
            }
        }

        return batchMatches;
    }

    // ========== 重构的主处理逻辑 ==========
    function processInBatches() {
        const generator = optimizedCombinationGenerator(percentages, count);
        let progressUpdateCounter = 0;
        const progressUpdateInterval = Math.max(1000, Math.floor(totalCombinations * 0.01));

        // 使用更高效的批处理
        function processNextBatch() {
            if (!isSearching || searchId !== currentSearchId) {
                finishSearch();
                return;
            }

            const batch = [];
            for (let i = 0; i < BATCH_SIZE; i++) {
                const next = generator.next();
                if (next.done) break;
                batch.push(next.value);
            }

            if (batch.length === 0) {
                finishSearch();
                return;
            }

            const batchMatches = processBatch(batch);

            // 批量更新结果 - 减少DOM操作
            if (batchMatches.length > 0) {
                foundCombinations.push(...batchMatches);

                // 延迟UI更新，提高性能
                if (foundCombinations.length <= MAX_RESULTS) {
                    setTimeout(() => {
                        batchMatches.forEach(result => {
                            addResultToUI(result);
                        });
                        updateResultsCount();
                    }, 0);
                }
            }

            // 优化的进度更新
            progressUpdateCounter += batch.length;
            if (progressUpdateCounter >= progressUpdateInterval) {
                updateProgress(checkedCombinations, totalCombinations);
                progressUpdateCounter = 0;
            }

            if (foundCombinations.length >= MAX_RESULTS) {
                finishSearch();
                return;
            }

            // 使用更快的调度方式
            if (typeof setImmediate !== 'undefined') {
                setImmediate(processNextBatch);
            } else {
                setTimeout(processNextBatch, 0);
            }
        }

        processNextBatch();
    }

    function finishSearch() {
        if (!isSearching || searchId !== currentSearchId) return;

        isSearching = false;
        document.querySelector('.btn-search').disabled = false;

        removeProgressBar();

        // 最终进度更新
        updateProgress(checkedCombinations, totalCombinations);

        const message = checkedCombinations === totalCombinations ?
            `✅ 搜索完成！检查了 ${checkedCombinations.toLocaleString()} 个组合，找到 ${foundCombinations.length} 个符合条件的结果` :
            `⏹️ 搜索完成！检查了 ${checkedCombinations.toLocaleString()} 个组合，找到 ${foundCombinations.length} 个符合条件的结果`;

        console.log(message);

        // 可选：显示完成提示
        if (foundCombinations.length > 0 || checkedCombinations === totalCombinations) {
            setTimeout(() => alert(message), 100);
        }
    }

    // 启动处理
    processInBatches();
}

function combinations(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;

    // 使用更高效的计算方式
    k = Math.min(k, n - k);
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

        const minWear = getIEEE754(parseFloat(minWearInput.value) || 0);
        const maxWear = getIEEE754Z(parseFloat(maxWearInput.value) || 1);
        const range = getIEEE754(maxWear, minWear);

        if (range <= 0) return;

        materialInputs.forEach((input, inputIndex) => {
            const wearValue = getIEEE754(parseFloat(input.value));
            if (wearValue > 0 && !isNaN(wearValue) && wearValue >= minWear && wearValue <= maxWear) {
                const numerator = getIEEE754(wearValue - minWear);
                const percentage = getIEEE754(numerator / range);

                allPercentages.push({
                    groupId: parseInt(groupId),
                    inputIndex: inputIndex,
                    wearValue: wearValue, // 原始磨损值
                    originalWear: wearValue, // 新增：明确存储原始磨损值
                    value: percentage, // 百分比值（用于计算）
                    displayValue: percentage,
                    // 新增：格式化显示的磨损值
                    displayWear: wearValue.toFixed(10)
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

    // 修改：显示原始磨损值而不是百分比
    const materialsStr = result.materials.map(m => {
        const group = document.getElementById(`materialGroup_${m.groupId}`);
        let groupName = `组${m.groupId}`;
        if (group) {
            const titleInput = group.querySelector('.group-title-input');
            if (titleInput && titleInput.value.trim()) {
                groupName = titleInput.value.trim();
            }
        }
        return `${m.wearValue.toFixed(10)} (${groupName}-${m.inputIndex + 1})`;
    }).join(' + ');

    const displayStr = materialsStr.length > 1068 ?
        materialsStr.substring(0, 1068) + '...' : materialsStr;
    
    resultItem.innerHTML = `
        <div class="result-wear">
            🎯 产物磨损: ${result.productWear}
            ${result.wearDiff ? `<small>(误差: ${result.wearDiff.toExponential(3)})</small>` : ''}
        </div>
        <div class="result-materials" title="${materialsStr.replace(/"/g, '&quot;')}">
            📦 材料组合: ${displayStr}
        </div>
        <div class="result-average">
            📊 平均百分比: ${result.averagePercent}
        </div>
        <div class="result-actions">
            <button class="btn-use" onclick="useCombination(${resultId}); event.stopPropagation();">
                ✅ 使用此组合（清除已用材料并新增到使用记录）
            </button>
        </div>
    `;

    resultsList.appendChild(resultItem);

    resultItem.style.opacity = '0';
    resultItem.style.transform = 'translateY(-10px)';
    resultItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

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
            const group = document.getElementById(`materialGroup_${material.groupId}`);
            if (group) {
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
        if (group) {
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
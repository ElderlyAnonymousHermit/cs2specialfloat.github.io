// ========== 材料组管理 ==========

let materialGroupCount = 0;
let inputsPerGroup = 15;
let materialGroups = [];

function addMaterialGroup() {
    materialGroupCount++;
    const groupId = materialGroupCount;
    materialGroups.push(groupId);
    
    const container = document.getElementById('fcMoreFloatsDiv');
    const groupDiv = document.createElement('div');
    groupDiv.className = 'material-group';
    groupDiv.id = `materialGroup_${groupId}`;
    groupDiv.dataset.groupId = groupId;
    
    const inputsHTML = generateMaterialInputsHTML(inputsPerGroup, groupId);
    
    groupDiv.innerHTML = `
        <div class="material-group-header">
            <div class="group-title-container">
                <input type="text" class="group-title-input" value="材料组 ${groupId}" placeholder="输入组名...">
            </div>
            <div class="group-controls">
                <button class="btn-fill" onclick="fillMaterialGroup(${groupId})" title="批量填充磨损值到输入框中">🔄 填充</button>
                <button class="btn-reverse" onclick="reverseBulkInput(${groupId})" title="颠倒批量输入框中的磨损顺序">🔄 颠倒</button>
                <button class="btn-calculate-single" onclick="calculateGroupPercentages(${groupId})">📊 计算</button>
                <button class="btn-clear-group" onclick="clearGroupMaterials(${groupId})">🗑️ 清空材料</button>
                <button class="btn-remove-group" onclick="removeSpecificMaterialGroup(${groupId})">❌ 删除组</button>
                <div class="custom-count-controls">
                    <label>材料数量:</label>
                    <input type="number" class="custom-input-count" min="1" max="30" value="${inputsPerGroup}" onchange="updateGroupMaterialCount(${groupId})">
                </div>
            </div>
        </div>
        
        <div class="wear-range-controls">
            <div class="wear-range-item">
                <label>📏 最小:</label>
                <input type="number" min="0" max="1" step="0.0000000001" value="0" class="fc-min-wear" onchange="handleWearRangeChange(${groupId})">
            </div>
            <div class="wear-range-item">
                <label>📏 最大:</label>
                <input type="number" min="0" max="1" step="0.0000000001" value="1" class="fc-max-wear" onchange="handleWearRangeChange(${groupId})">
            </div>
        </div>
        
        <!-- 添加推荐磨损值显示 -->
        <div class="wear-value-suggestion" id="wearValueSuggestion_${groupId}">
            🎯 设置产物磨损后显示推荐值
        </div>
        
        <div class="bulk-input-area">
            <div class="bulk-input-controls">
                <span style="color: #90caf9; font-size: 12px; font-weight: bold;">📥 批量输入:</span>
            </div>
            <div class="bulk-input-row">
                <textarea class="bulk-input" placeholder="输入逗号分隔的磨损值，例如：0.00013133,0.021313,0.4685684..." 
                          rows="2" onchange="updateWearValueSuggestion(${groupId})"></textarea>
            </div>
        </div>
        
        <div class="material-inputs-container">
            <div class="material-inputs-grid">
                ${inputsHTML}
            </div>
        </div>
        
        <div class="percentage-results" style="display: none;">
            <div class="percentage-header">
                <span class="percentage-title">📊 百分比结果</span>
                <button class="percentage-copy" onclick="copyPercentages(${groupId})">📋 复制</button>
            </div>
            <div class="percentage-output"></div>
        </div>
    `;
    
    container.appendChild(groupDiv);
    
    // 添加事件监听器
    const minWearInput = groupDiv.querySelector('.fc-min-wear');
    const maxWearInput = groupDiv.querySelector('.fc-max-wear');
    minWearInput.addEventListener('change', () => updateGroupWearRange(groupId));
    maxWearInput.addEventListener('change', () => updateGroupWearRange(groupId));
    
    const titleInput = groupDiv.querySelector('.group-title-input');
    titleInput.addEventListener('change', () => updateGroupName(groupId));
    
    // 初始化推荐值显示
    setTimeout(() => {
        updateWearValueSuggestion(groupId);
    }, 100);
    
    console.log(`添加材料组 ${groupId}，当前组:`, materialGroups);
}

// 更新组名函数（保持简单）
function updateGroupName(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (group) {
        const nameInput = group.querySelector('.group-title-input');
        console.log(`材料组 ${groupId} 名称更新为: ${nameInput.value}`);
    }
}
// 处理磨损区间变化
function handleWearRangeChange(groupId) {
    updateGroupWearRange(groupId);
    calculateGroupPercentages(groupId);
    updateWearRangeSuggestion(groupId);
}
function updateGroupMaterialCount(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    const countInput = group.querySelector('.custom-input-count');
    const newCount = parseInt(countInput.value) || 5;

    if (newCount < 1 || newCount > 30) {
        alert('材料数量必须在1-30之间！');
        countInput.value = inputsPerGroup;
        return;
    }

    // 保存当前数据
    const currentData = saveGroupData(groupId);

    // 重新生成输入框
    const inputsGrid = group.querySelector('.material-inputs-grid');
    inputsGrid.innerHTML = generateMaterialInputsHTML(newCount, groupId);

    // 恢复数据
    restoreGroupData(groupId, currentData, newCount);

    // 更新磨损范围
    updateGroupWearRange(groupId);
}

// 恢复组数据
function restoreGroupData(groupId, data, newCount) {
    if (!data) return;

    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    // 恢复标题
    const titleInput = group.querySelector('.group-title-input');
    if (titleInput && data.title) {
        titleInput.value = data.title;
    }

    // 恢复输入框数据
    const materialInputs = group.querySelectorAll('.material-input');
    materialInputs.forEach((input, index) => {
        if (index < data.inputs.length) {
            input.value = data.inputs[index];
        }
    });

    // 重新计算百分比
    calculateGroupPercentages(groupId);
}

// 保存组数据
function saveGroupData(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return null;

    const materialInputs = group.querySelectorAll('.material-input');
    const data = {
        title: group.querySelector('.group-title-input').value,
        inputs: []
    };

    materialInputs.forEach(input => {
        data.inputs.push(input.value);
    });

    return data;
}

function generateMaterialInputsHTML(count, groupId) {
    let html = '';
    for (let i = 1; i <= count; i++) {
        html += `
            <div class="material-input-container">
                <input class="material-input fcMoreFloats" type="number" min="0" max="1" step="0.0000000001" value="0.0000000000" placeholder="磨损 ${i}" onchange="fcUpdateCombinations()">
                <div class="percentage-display" id="percentage_${groupId}_${i}"></div>
            </div>
        `;
    }
    return html;
}
// 简单的组计数更新（不影响现有组）
function updateMaterialGroupCount() {
    const groups = document.querySelectorAll('.material-group');
    console.log(`当前材料组数量: ${groups.length}`);
}

// ========== 修复删除功能 ==========
function removeSpecificMaterialGroup(groupId) {
    console.log(`尝试删除材料组 ${groupId}，当前组:`, materialGroups);
    
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (group) {
        if (!confirm('确定要删除这个材料组吗？')) {
            return;
        }
        
        // 直接从DOM移除
        group.remove();
        
        // 从数组中移除指定的groupId
        const index = materialGroups.indexOf(groupId);
        if (index > -1) {
            materialGroups.splice(index, 1);
        }
        
        // 不再重新编号所有组，保持其他组不变
        console.log(`删除完成，剩余组:`, materialGroups);
        
        // 更新全局计数（可选）
        updateMaterialGroupCount();
    } else {
        alert('找不到要删除的材料组！');
    }
}
function removeLastMaterialGroup() {
    if (materialGroups.length === 0) {
        alert('没有可删除的材料组！');
        return;
    }

    const lastGroupId = materialGroups[materialGroups.length - 1];
    removeSpecificMaterialGroup(lastGroupId);
}


// 修改：更新所有材料组时保持数据
function updateAllMaterialGroups() {
    const inputCount = parseInt(document.getElementById('globalInputCount').value) || 5;
    if (inputCount < 1 || inputCount > 30) {
        alert('材料数量必须在1-30之间！');
        return;
    }
    
    inputsPerGroup = inputCount;
    const groups = document.querySelectorAll('.material-group');
    
    groups.forEach((group) => {
        const groupId = group.dataset.groupId;
        // 保存当前数据
        const currentData = saveGroupData(groupId);
        
        const inputsGrid = group.querySelector('.material-inputs-grid');
        if (inputsGrid) {
            inputsGrid.innerHTML = generateMaterialInputsHTML(inputsPerGroup, groupId);
            
            // 恢复数据
            restoreGroupData(groupId, currentData, inputsPerGroup);
            
            // 更新自定义数量输入框
            const customCountInput = group.querySelector('.custom-input-count');
            if (customCountInput) {
                customCountInput.value = inputsPerGroup;
            }
        }
    });
}
// 其他材料组函数...
function updateGroupName(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (group) {
        const nameInput = group.querySelector('.group-title-input');
        console.log(`材料组 ${groupId} 名称更新为: ${nameInput.value}`);
    }
}
// 修改：清空材料组（替代删除）
function clearGroupMaterials(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    if (!confirm('确定要清空这个材料组内的所有内容吗？')) {
        return;
    }

    const materialInputs = group.querySelectorAll('.material-input');
    const percentageDisplays = group.querySelectorAll('.percentage-display');
    const bulkInput = group.querySelector('.bulk-input');
    const minWearInput = group.querySelector('.fc-min-wear');
    const maxWearInput = group.querySelector('.fc-max-wear');
    const titleInput = group.querySelector('.group-title-input');
        const minWearInputValue = group.querySelector('.fc-min-wear').value;
    const maxWearInputValue = group.querySelector('.fc-max-wear').value;
    const titleInputValue = group.querySelector('.group-title-input').value;
    // 清空输入框但保留组结构
    materialInputs.forEach(input => {
        input.value = '0.0000000000';
    });

    percentageDisplays.forEach(display => {
        display.textContent = '';
    });

    if (bulkInput) {
        bulkInput.value = '';
    }

    if (minWearInput) minWearInput.value = minWearInputValue;
    if (maxWearInput) maxWearInput.value = maxWearInputValue;
    if (titleInput) titleInput.value = titleInputValue;

    const percentageResults = group.querySelector('.percentage-results');
    if (percentageResults) {
        percentageResults.style.display = 'none';
    }

    alert('✅ 材料组已清空！');
}


function calculateGroupPercentages(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    const minWearInput = group.querySelector('.fc-min-wear');
    const maxWearInput = group.querySelector('.fc-max-wear');
    const materialInputs = group.querySelectorAll('.material-input');
    const percentageResults = group.querySelector('.percentage-results');
    const percentageOutput = group.querySelector('.percentage-output');

    const minWear = getIEEE754(parseFloat(minWearInput.value) || 0);
    const maxWear = getIEEE754(parseFloat(maxWearInput.value) || 1);

    const range = getIEEE754(maxWear-minWear);

    if (range <= 0) {
        alert('最大磨损必须大于最小磨损！');
        return;
    }

    const percentages = [];

    materialInputs.forEach((input, index) => {
        const wearValue = getIEEE754(parseFloat(input.value));
        const percentageDisplay = document.getElementById(`percentage_${groupId}_${index + 1}`);

        if (wearValue > 0 && !isNaN(wearValue)) {
            const numerator = getIEEE754(wearValue- minWear);
            const percentage = getIEEE754(numerator/range);

            const formattedPercentage = percentage;
            percentageDisplay.textContent = formattedPercentage;
            percentageDisplay.style.color = '#4caf50';

            percentages.push(formattedPercentage);
        } else {
            percentageDisplay.textContent = '';
            percentageDisplay.style.color = '#90caf9';
        }
    });

    if (percentages.length > 0) {
        percentageOutput.textContent = percentages.join(', ');
        percentageResults.style.display = 'block';
    } else {
        percentageResults.style.display = 'none';
    }
}

function calculateAllPercentages() {
    const groups = document.querySelectorAll('.material-group');
    let hasResults = false;

    groups.forEach((group) => {
        const groupId = group.dataset.groupId;
        calculateGroupPercentages(parseInt(groupId));
        const percentageResults = group.querySelector('.percentage-results');
        if (percentageResults && percentageResults.style.display !== 'none') {
            hasResults = true;
        }
    });

    if (!hasResults) {
        alert('没有有效的磨损值可以计算百分比！');
    }
}

function copyPercentages(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    const percentageOutput = group.querySelector('.percentage-output');
    if (!percentageOutput) return;

    const text = percentageOutput.textContent;
    if (!text.trim()) return;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = percentageOutput.textContent;
        percentageOutput.textContent = '✅ 已复制到剪贴板！';
        percentageOutput.style.color = '#4caf50';

        setTimeout(() => {
            percentageOutput.textContent = originalText;
            percentageOutput.style.color = '#90caf9';
        }, 1500);
    }).catch(err => {
        alert('复制失败: ' + err);
    });
}

function updateAllMaterialGroups() {
    const inputCount = parseInt(document.getElementById('globalInputCount').value) || 5;
    if (inputCount < 1 || inputCount > 30) {
        alert('材料数量必须在1-30之间！');
        return;
    }

    inputsPerGroup = inputCount;
    const groups = document.querySelectorAll('.material-group');

    groups.forEach((group) => {
        const groupId = group.dataset.groupId;
        const inputsGrid = group.querySelector('.material-inputs-grid');
        if (inputsGrid) {
            inputsGrid.innerHTML = generateMaterialInputsHTML(inputsPerGroup, groupId);
            updateGroupWearRange(parseInt(groupId));
        }
    });
}

function updateGroupWearRange(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    const minWearInput = group.querySelector('.fc-min-wear');
    const maxWearInput = group.querySelector('.fc-max-wear');
    const materialInputs = group.querySelectorAll('.material-input');

    const minWear = parseFloat(minWearInput.value) || 0;
    const maxWear = parseFloat(maxWearInput.value) || 1;

    materialInputs.forEach(input => {
        input.min = minWear;
        input.max = maxWear;
    });
}

function fillMaterialGroup(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    const bulkInput = group.querySelector('.bulk-input');
    const materialInputs = group.querySelectorAll('.material-input');
    const minWearInput = group.querySelector('.fc-min-wear');
    const maxWearInput = group.querySelector('.fc-max-wear');

    if (!bulkInput.value.trim()) {
        alert('请输入要填充的磨损值！');
        return;
    }

    const originalValues = bulkInput.value.split(/[,，\s]+/).map(val => val.trim()).filter(val => val !== '');
    const numericValues = [];

    originalValues.forEach(originalVal => {
        const num = parseFloat(originalVal);
        if (!isNaN(num)) {
            numericValues.push(num);
        }
    });

    if (numericValues.length === 0) {
        alert('没有有效的数字！请检查输入格式。');
        return;
    }

    const minWear = parseFloat(minWearInput.value) || 0;
    const maxWear = parseFloat(maxWearInput.value) || 1;

    const validValues = numericValues.filter(numVal => numVal >= minWear && numVal <= maxWear);

    if (validValues.length === 0) {
        alert(`所有值都不在磨损范围内 [${minWear.toFixed(10)}, ${maxWear.toFixed(10)}]！`);
        return;
    }

    let valueIndex = 0;
    let filledCount = 0;

    for (let i = 0; i < materialInputs.length && valueIndex < validValues.length; i++) {
        const currentValue = parseFloat(materialInputs[i].value);
        if (isNaN(currentValue) || currentValue === 0) {
            materialInputs[i].value = validValues[valueIndex].toFixed(10);
            valueIndex++;
            filledCount++;
        }
    }

    const remainingValues = originalValues.slice(valueIndex);
    bulkInput.value = remainingValues.join(', ');

    if (filledCount > 0) {
        if (remainingValues.length > 0) {
            alert(`✅ 成功填充 ${filledCount} 个磨损值！剩余 ${remainingValues.length} 个值在输入框中。`);
        } else {
            alert(`✅ 成功填充 ${filledCount} 个磨损值！所有值已用完。`);
        }

        calculateGroupPercentages(groupId);
    } else {
        alert('没有可用的空输入框来填充材料！');
    }
}

function reverseBulkInput(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    const materialInputs = group.querySelectorAll('.material-input');
    const percentageDisplays = group.querySelectorAll('.percentage-display');
    
    // 收集所有输入框的值
    const values = [];
    const percentages = [];
    
    materialInputs.forEach((input, index) => {
        const value = parseFloat(input.value);
        values.push(isNaN(value) ? 0 : value);
        
        // 同时收集对应的百分比显示
        if (percentageDisplays[index]) {
            percentages.push(percentageDisplays[index].textContent);
        }
    });
    
    // 检查是否有有效的材料值
    const hasValidMaterials = values.some(value => value > 0);
    if (!hasValidMaterials) {
        alert('没有有效的材料磨损值可以颠倒！');
        return;
    }
    
    if (!confirm('确定要颠倒所有材料输入框的顺序吗？')) {
        return;
    }
    
    // 颠倒数组
    const reversedValues = [...values].reverse();
    const reversedPercentages = [...percentages].reverse();
    
    // 应用颠倒后的值
    materialInputs.forEach((input, index) => {
        input.value = reversedValues[index].toFixed(10);
        
        // 添加动画效果
        input.style.transition = 'all 0.3s ease';
        input.style.background = 'rgba(255, 152, 0, 0.3)';
        setTimeout(() => {
            input.style.background = '';
        }, 1000);
    });
    
    // 更新百分比显示
    percentageDisplays.forEach((display, index) => {
        if (display) {
            display.textContent = reversedPercentages[index];
            if (reversedPercentages[index]) {
                display.style.color = '#4caf50';
            } else {
                display.style.color = '#90caf9';
            }
        }
    });
    
    // 重新计算百分比
    calculateGroupPercentages(groupId);
    
    alert('✅ 材料输入框顺序已成功颠倒！');
}
function getAllMaterialValues() {
    const allValues = [];
    const groups = document.querySelectorAll('.material-group');

    groups.forEach(group => {
        const inputs = group.querySelectorAll('.material-input');
        const groupValues = [];
        inputs.forEach(input => {
            const value = parseFloat(input.value);
            if (value > 0) {
                groupValues.push(value);
            }
        });
        if (groupValues.length > 0) {
            allValues.push(groupValues);
        }
    });

    return allValues;
}

function fcUpdateCombinations() {
    const allValues = getAllMaterialValues();
    console.log('当前所有材料组值:', allValues);
}


// ========== 磨损区间推荐功能 ==========
function calculateRecommendedWearRange(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    const materialInputs = group.querySelectorAll('.material-input');
    const values = [];

    // 收集所有有效磨损值
    materialInputs.forEach(input => {
        const value = parseFloat(input.value);
        if (value > 0 && !isNaN(value)) {
            values.push(value);
        }
    });

    if (values.length === 0) {
        return { min: 0, max: 1 };
    }

    // 计算推荐区间（包含所有值并扩展10%范围）
    const currentMin = Math.min(...values);
    const currentMax = Math.max(...values);
    const range = currentMax - currentMin;
    const padding = range * 0.1; // 10% 扩展

    return {
        min: getIEEE754(Math.max(0, currentMin - padding)),
        max: getIEEE754(Math.min(1, currentMax + padding))
    };
}

function updateWearRangeSuggestion(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    const suggestionElement = group.querySelector('.wear-range-suggestion');
    if (!suggestionElement) return;

    const recommended = calculateRecommendedWearRange(groupId);

    suggestionElement.innerHTML = `
        💡 推荐区间: ${recommended.min.toFixed(10)} - ${recommended.max.toFixed(10)}
        <button class="btn-apply-suggestion" onclick="applyRecommendedWearRange(${groupId})">✅ 应用</button>
    `;
}

function applyRecommendedWearRange(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    const recommended = calculateRecommendedWearRange(groupId);
    const minWearInput = group.querySelector('.fc-min-wear');
    const maxWearInput = group.querySelector('.fc-max-wear');

    minWearInput.value = recommended.min.toFixed(10);
    maxWearInput.value = recommended.max.toFixed(10);

    // 更新磨损范围并重新计算百分比
    updateGroupWearRange(groupId);
    calculateGroupPercentages(groupId);

    alert('✅ 已应用推荐磨损区间！');
}






// ========== 材料组推荐磨损值功能 ==========
function calculateRecommendedWearValue(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return null;

    // 获取产物期望磨损百分比
    const targetProductWear = getIEEE754(parseFloat(document.getElementById('targetProductWear').value));
    const productMinWear = getIEEE754(parseFloat(document.getElementById('productMinWear').value) || 0);
    const productMaxWear = getIEEE754(parseFloat(document.getElementById('productMaxWear').value) || 1);

    if (isNaN(targetProductWear) || productMinWear >= productMaxWear) {
        return null;
    }

    // 计算所需的磨损百分比
    const wearRange = getIEEE754(productMaxWear- productMinWear);
    const numerator = getIEEE754(targetProductWear- productMinWear);
    const requiredPercentage = getIEEE754(numerator/wearRange);

    // 获取当前材料组的磨损范围
    const materialMinWear = getIEEE754(parseFloat(group.querySelector('.fc-min-wear').value) || 0);
    const materialMaxWear = getIEEE754(parseFloat(group.querySelector('.fc-max-wear').value) || 1);
    const materialRange = getIEEE754(materialMaxWear- materialMinWear);

    // 计算推荐的目标磨损值
    // 公式: requiredPercentage * materialRange + materialMinWear
    const recommendedWear = getIEEE754(
       getIEEE754(requiredPercentage*materialRange)+materialMinWear
    );

    // 保留三位有效数字
    const recommendedWearRounded = parseFloat(recommendedWear.toPrecision(3));

    return {
        wearValue: recommendedWearRounded,
        requiredPercentage: requiredPercentage,
        calculation: `${requiredPercentage.toFixed(6)} × (${materialMaxWear} - ${materialMinWear}) + ${materialMinWear}`
    };
}

function updateWearValueSuggestion(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    let suggestionElement = group.querySelector('.wear-value-suggestion');
    if (!suggestionElement) {
        // 如果不存在，创建推荐元素
        const wearRangeControls = group.querySelector('.wear-range-controls');
        suggestionElement = document.createElement('div');
        suggestionElement.className = 'wear-value-suggestion';
        suggestionElement.id = `wearValueSuggestion_${groupId}`;
        wearRangeControls.parentNode.insertBefore(suggestionElement, wearRangeControls.nextSibling);
    }

    const recommendation = calculateRecommendedWearValue(groupId);

    if (!recommendation) {
        suggestionElement.innerHTML = `
            ⚠️ 无法计算推荐值 - 请检查产物磨损设置
        `;
        suggestionElement.className = 'wear-value-suggestion error';
        return;
    }

    // 显示推荐磨损值和计算过程
    suggestionElement.innerHTML = `
        🎯 推荐磨损值范围: <strong>${(recommendation.wearValue*0.9168)}</strong><strong>${'~~~'}</strong><strong>${(recommendation.wearValue*1.168)}</strong>
        <br>
        <span class="suggestion-calculation">
            计算: ${recommendation.calculation}
        </span>
        <button class="btn-apply-suggestion" onclick="applyRecommendedWearValue(${groupId})" title="随机生成范围内的材料自动填充（不会占用已有值），用于测试目标磨损是否存在">✅ 填充随机材料</button>
    `;
    suggestionElement.className = 'wear-value-suggestion suggested';
}

function applyRecommendedWearValue(groupId) {
    const group = document.getElementById(`materialGroup_${groupId}`);
    if (!group) return;

    const recommendation = calculateRecommendedWearValue(groupId);
    if (!recommendation) {
        alert('无法计算推荐值，请先设置正确的产物磨损参数！');
        return;
    }

    // 找到第一个空的或值为0的材料输入框
    const materialInputs = group.querySelectorAll('.material-input');
    let applied = false;

    for (let input of materialInputs) {
        const currentValue = parseFloat(input.value);
        if (isNaN(currentValue) || currentValue === 0) {
            

            input.value = recommendation.wearValue*(Math.random()*(1.168-1)+0.9168)
            applied = true;
            continue;
        }
    }

    if (!applied) {
        // 如果没有空位，询问用户是否覆盖第一个
        if (confirm('所有材料输入框都已使用，是否覆盖第一个输入框？')) {
            materialInputs[0].value = recommendation.wearValue.toFixed(10);
            applied = true;
        }
    }

    if (applied) {
        // 重新计算百分比
        calculateGroupPercentages(groupId);
        alert(`✅ 已随机填充范围: ${recommendation.wearValue*0.9168.toFixed(10)}~${recommendation.wearValue*1.168.toFixed(10)}内的磨损值`);
    }
}

// 监听产物磨损设置变化
function setupWearValueListeners() {
    const targetWearInput = document.getElementById('targetProductWear');
    const productMinWearInput = document.getElementById('productMinWear');
    const productMaxWearInput = document.getElementById('productMaxWear');

    if (targetWearInput) {
        targetWearInput.addEventListener('change', updateAllWearValueSuggestions);
    }
    if (productMinWearInput) {
        productMinWearInput.addEventListener('change', updateAllWearValueSuggestions);
    }
    if (productMaxWearInput) {
        productMaxWearInput.addEventListener('change', updateAllWearValueSuggestions);
    }
}

function updateAllWearValueSuggestions() {
    const groups = document.querySelectorAll('.material-group');
    groups.forEach(group => {
        const groupId = group.dataset.groupId;
        updateWearValueSuggestion(parseInt(groupId));
    });
}

// 监听材料组磨损范围变化
function handleWearRangeChange(groupId) {
    updateGroupWearRange(groupId);
    calculateGroupPercentages(groupId);
    updateWearValueSuggestion(groupId); // 更新推荐值
}





//v3.36新增已用材料删除，
function addUsedMaterialsControl() {
    const globalControls = document.querySelector('.fc-global-controls .control-group');
    
    // 检查是否已经添加过
    if (document.getElementById('usedMaterialsInput')) {
        return;
    }
    
    const usedMaterialsHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-left: 20px;">
            <label style="color: #60a5fa; font-weight: bold; white-space: nowrap;">🗑️ 已使用的材料:</label>
            <input type="text" id="usedMaterialsInput" 
                   placeholder="输入逗号分隔的磨损值，如: 0.12, 0.34, 0.56" 
                   style="padding: 8px 12px; border: 1px solid #555; border-radius: 6px; 
                          background: rgba(255,255,255,0.1); color: white; width: 300px;">
            <button onclick="clearUsedMaterials()" 
                    style="background: linear-gradient(135deg, #f44336, #d32f2f); color: white; 
                           border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;
                           font-weight: bold; white-space: nowrap;">
                🗑️ 清除已使用材料
            </button>
        </div>
    `;
    
    globalControls.insertAdjacentHTML('beforeend', usedMaterialsHTML);
}

// 清除已使用材料功能
function clearUsedMaterials() {
    const usedMaterialsInput = document.getElementById('usedMaterialsInput');
    //去除高亮
        document.querySelectorAll('.material-highlight, .percentage-highlight').forEach(el => {
        el.classList.remove('material-highlight', 'percentage-highlight');
    });
    if (!usedMaterialsInput || !usedMaterialsInput.value.trim()) {
        alert('请输入要清除的已使用材料磨损值！');
        return;
    }
    
    if (!confirm('确定要清除所有与输入值匹配的材料吗？此操作不可撤销。')) {
        return;
    }
    
    // 解析输入的磨损值
    const usedValues = usedMaterialsInput.value
        .match(/\d+\.\d+/g) || []
        .map(val => parseFloat(val.trim()))
        .filter(val => !isNaN(val) && val > 0);
    
    if (usedValues.length === 0) {
        alert('没有有效的磨损值！请检查输入格式。');
        return;
    }
    
    let totalCleared = 0;
    let totalMoved = 0;
    
    // 遍历所有材料组
    const groups = document.querySelectorAll('.material-group');
    groups.forEach(group => {
        const groupId = group.dataset.groupId;
        const materialInputs = group.querySelectorAll('.material-input');
        const percentageDisplays = group.querySelectorAll('.percentage-display');
        
        // 第一步：标记和清除匹配的材料
        const clearedPositions = [];
        const remainingMaterials = [];
        
        materialInputs.forEach((input, index) => {
            const wearValue = getIEEE754(parseFloat(input.value)).toFixed(10);
            
            // 检查是否匹配已使用材料
            const isUsed = usedValues.some(usedVal => 
                Math.abs(wearValue - getIEEE754(usedVal).toFixed(10)) ==0 // 使用极小容差进行浮点数比较
            );
            
            if (isUsed && wearValue > 0) {
                // 清除匹配的材料
                input.value = '0.0000000000';
                if (percentageDisplays[index]) {
                    percentageDisplays[index].textContent = '';
                }
                clearedPositions.push(index);
                totalCleared++;
            } else if (wearValue > 0) {
                // 保留未匹配的材料及其位置信息
                remainingMaterials.push({
                    index: index,
                    value: input.value,
                    percentage: percentageDisplays[index] ? percentageDisplays[index].textContent : ''
                });
            }
        });
        
        // 第二步：向前移动剩余材料填补空缺
        if (clearedPositions.length > 0 && remainingMaterials.length > 0) {
            // 创建新的材料数组（填补空缺后的状态）
            const newMaterialValues = Array(materialInputs.length).fill('0.0000000000');
            const newPercentages = Array(materialInputs.length).fill('');
            
            // 将剩余材料按顺序填充到前面的位置
            let currentPosition = 0;
            remainingMaterials.forEach(material => {
                newMaterialValues[currentPosition] = material.value;
                newPercentages[currentPosition] = material.percentage;
                currentPosition++;
            });
            
            // 应用新的材料顺序
            materialInputs.forEach((input, index) => {
                input.value = newMaterialValues[index];
            });
            
            percentageDisplays.forEach((display, index) => {
                if (display) {
                    display.textContent = newPercentages[index];
                    // 更新显示样式
                    if (newPercentages[index]) {
                        display.style.color = '#4caf50';
                    } else {
                        display.style.color = '#90caf9';
                    }
                }
            });
            
            totalMoved += remainingMaterials.length;
        }
        
        // 重新计算该组的百分比
        calculateGroupPercentages(parseInt(groupId));
    });
    
    // 显示操作结果
    let message = `✅ 成功清除 ${totalCleared} 个已使用材料`;
    if (totalMoved > 0) {
        message += `，并向前移动了材料填补空缺`;
    }
    
    alert(message);
    
    // 清空输入框
    usedMaterialsInput.value = '';
    
    // 更新所有组合
    fcUpdateCombinations();
}

// 在添加材料组时自动添加控制元素
function addMaterialGroup() {
    materialGroupCount++;
    const groupId = materialGroupCount;
    materialGroups.push(groupId);
    
    const container = document.getElementById('fcMoreFloatsDiv');
    const groupDiv = document.createElement('div');
    groupDiv.className = 'material-group';
    groupDiv.id = `materialGroup_${groupId}`;
    groupDiv.dataset.groupId = groupId;
    
    const inputsHTML = generateMaterialInputsHTML(inputsPerGroup, groupId);
    
    groupDiv.innerHTML = `
        <div class="material-group-header">
            <div class="group-title-container">
                <input type="text" class="group-title-input" value="材料组 ${groupId}" placeholder="输入组名...">
            </div>
            <div class="group-controls">
                <button class="btn-fill" onclick="fillMaterialGroup(${groupId})">🔄 填充</button>
                <button class="btn-reverse" onclick="reverseBulkInput(${groupId})">🔄 颠倒</button>
                <button class="btn-calculate-single" onclick="calculateGroupPercentages(${groupId})">📊 计算</button>
                <button class="btn-clear-group" onclick="clearGroupMaterials(${groupId})">🗑️ 清空材料</button>
                <button class="btn-remove-group" onclick="removeSpecificMaterialGroup(${groupId})">❌ 删除组</button>
                <div class="custom-count-controls">
                    <label>材料数量:</label>
                    <input type="number" class="custom-input-count" min="1" max="30" value="${inputsPerGroup}" onchange="updateGroupMaterialCount(${groupId})">
                </div>
            </div>
        </div>
        
        <div class="wear-range-controls">
            <div class="wear-range-item">
                <label>📏 最小:</label>
                <input type="number" min="0" max="1" step="0.0000000001" value="0" class="fc-min-wear" onchange="handleWearRangeChange(${groupId})">
            </div>
            <div class="wear-range-item">
                <label>📏 最大:</label>
                <input type="number" min="0" max="1" step="0.0000000001" value="1" class="fc-max-wear" onchange="handleWearRangeChange(${groupId})">
            </div>
        </div>
        
        <!-- 添加推荐磨损值显示 -->
        <div class="wear-value-suggestion" id="wearValueSuggestion_${groupId}">
            🎯 设置产物磨损后显示推荐值
        </div>
        
        <div class="bulk-input-area">
            <div class="bulk-input-controls">
                <span style="color: #90caf9; font-size: 12px; font-weight: bold;">📥 批量输入:</span>
            </div>
            <div class="bulk-input-row">
                <textarea class="bulk-input" placeholder="输入逗号分隔的磨损值，例如：0.00013133,0.021313,0.4685684..." 
                          rows="2" onchange="updateWearValueSuggestion(${groupId})"></textarea>
            </div>
        </div>
        
        <div class="material-inputs-container">
            <div class="material-inputs-grid">
                ${inputsHTML}
            </div>
        </div>
        
        <div class="percentage-results" style="display: none;">
            <div class="percentage-header">
                <span class="percentage-title">📊 百分比结果</span>
                <button class="percentage-copy" onclick="copyPercentages(${groupId})">📋 复制</button>
            </div>
            <div class="percentage-output"></div>
        </div>
    `;
    
    container.appendChild(groupDiv);        
    
    // 添加事件监听器
    const minWearInput = groupDiv.querySelector('.fc-min-wear');
    const maxWearInput = groupDiv.querySelector('.fc-max-wear');
    minWearInput.addEventListener('change', () => updateGroupWearRange(groupId));
    maxWearInput.addEventListener('change', () => updateGroupWearRange(groupId));
    
    const titleInput = groupDiv.querySelector('.group-title-input');
    titleInput.addEventListener('change', () => updateGroupName(groupId));
    
    // 初始化推荐值显示
    setTimeout(() => {
        updateWearValueSuggestion(groupId);
    }, 100);
    
    console.log(`添加材料组 ${groupId}，当前组:`, materialGroups);
    
    // 确保已使用材料控制元素存在
    setTimeout(() => {
        addUsedMaterialsControl();
    }, 200);
}

// 在页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化已使用材料控制
    setTimeout(() => {
        addUsedMaterialsControl();
    }, 1000);
});
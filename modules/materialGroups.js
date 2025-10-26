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

    if (minWearInput) minWearInput.value = '0';
    if (maxWearInput) maxWearInput.value = '1';
    if (titleInput) titleInput.value = `材料组 ${groupId}`;

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

    const minWear = parseFloat(minWearInput.value) || 0;
    const maxWear = parseFloat(maxWearInput.value) || 1;

    const range = IEEE754Float32.subtract(maxWear, minWear);

    if (range <= 0) {
        alert('最大磨损必须大于最小磨损！');
        return;
    }

    const percentages = [];

    materialInputs.forEach((input, index) => {
        const wearValue = parseFloat(input.value);
        const percentageDisplay = document.getElementById(`percentage_${groupId}_${index + 1}`);

        if (wearValue > 0 && !isNaN(wearValue)) {
            const numerator = IEEE754Float32.subtract(wearValue, minWear);
            const percentage = IEEE754Float32.divide(numerator, range);

            const formattedPercentage = IEEE754Float32.formatPrecise(percentage);
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

    const bulkInput = group.querySelector('.bulk-input');
    if (!bulkInput.value.trim()) {
        alert('请输入要颠倒顺序的磨损值！');
        return;
    }

    const values = bulkInput.value.split(/[,，\s]+/).map(val => val.trim()).filter(val => val !== '');

    if (values.length === 0) {
        alert('没有有效的值！');
        return;
    }

    const reversedValues = values.reverse();
    bulkInput.value = reversedValues.join(', ');
    alert('✅ 顺序已颠倒！');
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
        min: IEEE754Float32.ensureFloat32(Math.max(0, currentMin - padding)),
        max: IEEE754Float32.ensureFloat32(Math.min(1, currentMax + padding))
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
    const targetProductWear = parseFloat(document.getElementById('targetProductWear').value);
    const productMinWear = parseFloat(document.getElementById('productMinWear').value) || 0;
    const productMaxWear = parseFloat(document.getElementById('productMaxWear').value) || 1;

    if (isNaN(targetProductWear) || productMinWear >= productMaxWear) {
        return null;
    }

    // 计算所需的磨损百分比
    const wearRange = IEEE754Float32.subtract(productMaxWear, productMinWear);
    const numerator = IEEE754Float32.subtract(targetProductWear, productMinWear);
    const requiredPercentage = IEEE754Float32.divide(numerator, wearRange);

    // 获取当前材料组的磨损范围
    const materialMinWear = parseFloat(group.querySelector('.fc-min-wear').value) || 0;
    const materialMaxWear = parseFloat(group.querySelector('.fc-max-wear').value) || 1;
    const materialRange = IEEE754Float32.subtract(materialMaxWear, materialMinWear);

    // 计算推荐的目标磨损值
    // 公式: requiredPercentage * materialRange + materialMinWear
    const recommendedWear = IEEE754Float32.add(
        IEEE754Float32.multiply(requiredPercentage, materialRange),
        materialMinWear
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
        🎯 推荐磨损值: <strong>${(recommendation.wearValue*0.91698).toFixed(6),'~~',(recommendation.wearValue*1.1).toFixed(6)}</strong>
        <br>
        <span class="suggestion-calculation">
            计算: ${recommendation.calculation}
        </span>
        <button class="btn-apply-suggestion" onclick="applyRecommendedWearValue(${groupId})">✅ 应用到材料</button>
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
            input.value = recommendation.wearValue.toFixed(10);
            applied = true;
            break;
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
        alert(`✅ 已应用推荐磨损值: ${recommendation.wearValue.toFixed(10)}`);
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
// ========== 使用记录功能 ==========
let usageHistory = [];

function toggleUsageHistory() {
    const history = document.getElementById('usageHistory');
    history.style.display = history.style.display === 'none' ? 'block' : 'none';
}

function clearUsageHistory() {
    if (!confirm('确定要清空所有使用记录吗？')) {
        return;
    }
    
    usageHistory = [];
    saveUsageHistory();
    updateUsageHistoryDisplay();
    alert('✅ 使用记录已清空！');
}

function saveUsageHistory() {
    localStorage.setItem('materialCombinationUsageHistory', JSON.stringify(usageHistory));
}

function loadUsageHistory() {
    const saved = localStorage.getItem('materialCombinationUsageHistory');
    if (saved) {
        usageHistory = JSON.parse(saved);
        updateUsageHistoryDisplay();
    }
}

function addUsageHistory(result) {
    const timestamp = new Date().toLocaleString();
    
    // 修改：显示原始磨损值而不是百分比
    const materialsStr = result.materials.map(m => 
        `${m.wearValue.toFixed(10)} (${m.groupId}-${m.inputIndex + 1})`
    ).join(', ');
    
    const truncatedMaterials = materialsStr;
    
    const historyItem = {
        timestamp: timestamp,
        productWear: getIEEE754(result.productWear),
        averagePercent: getIEEE754(result.averagePercent),
        materialCount: result.materials.length,
        materials: truncatedMaterials,
        // 新增：存储完整的材料信息用于详细显示
        fullMaterials: result.materials.map(m => ({
            wearValue: m.wearValue,
            groupId: m.groupId,
            inputIndex: m.inputIndex
        }))
    };
    
    usageHistory.unshift(historyItem);
    
    if (usageHistory.length > 50) {
        usageHistory = usageHistory.slice(0, 50);
    }
    
    saveUsageHistory();
    updateUsageHistoryDisplay();
}

function updateUsageHistoryDisplay() {
    const historyList = document.getElementById('usageHistoryList');
    historyList.innerHTML = '';
    
    if (usageHistory.length === 0) {
        historyList.innerHTML = '<div class="usage-history-item" data-i18n="noHistory">暂无使用记录</div>';
        applyLanguage();
        return;
    }
    
    usageHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'usage-history-item';
        historyItem.innerHTML = `
            <div><strong>${item.timestamp}</strong></div>
            <div>产物磨损: ${item.productWear} | 平均百分比: ${item.averagePercent}</div>
            <div>材料: ${item.materials}</div>
        `;
        
        // 添加点击查看详情功能
        historyItem.onclick = () => showHistoryDetails(item);
        historyList.appendChild(historyItem);
    });
}


function showHistoryDetails(historyItem) {
    // 构建详细材料信息
    let detailedMaterials = '详细材料信息:\n';
    historyItem.fullMaterials.forEach((material, index) => {
        detailedMaterials += `材料 ${index + 1}: ${material.wearValue.toFixed(10)} (组${material.groupId}-位置${material.inputIndex + 1})\n`;
    });
    
    alert(`🎯 历史组合详情\n\n` +
          `时间: ${historyItem.timestamp}\n` +
          `产物磨损: ${historyItem.productWear}\n` +
          `平均百分比: ${historyItem.averagePercent}\n` +
          `材料数量: ${historyItem.materialCount}个\n\n` +
          `${detailedMaterials}`);
}
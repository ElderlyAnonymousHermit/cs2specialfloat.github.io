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
    
    // 移除截断，完整显示材料信息
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
    
    const historyItem = {
        timestamp: timestamp,
        productWear: IEEE754Float32.formatPrecise(result.productWear),
        averagePercent: IEEE754Float32.formatPrecise(result.averagePercent),
        materialCount: result.materials.length,
        materials: materialsStr // 完整字符串，不截断
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
        
        // 完整显示材料信息，不截断
        historyItem.innerHTML = `
            <div><strong>${item.timestamp}</strong></div>
            <div>🎯 产物磨损: ${item.productWear} | 平均百分比: ${item.averagePercent}</div>
            <div>📦 材料组合: ${item.materials}</div>
        `;
        
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
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
    
    const materialsStr = result.materials.map(m => m.displayValue).join(', ');
    const truncatedMaterials = materialsStr.length > 1026 ? 
        materialsStr.substring(0, 1026) + '...' : materialsStr;
    
    const historyItem = {
        timestamp: timestamp,
        productWear: IEEE754Float32.formatPrecise(result.productWear),
        averagePercent: IEEE754Float32.formatPrecise(result.averagePercent),
        materialCount: result.materials.length,
        materials: truncatedMaterials
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
            <div>产物: ${item.productWear} | 平均: ${item.averagePercent}</div>
            <div>材料: ${item.materials}</div>
        `;
        historyList.appendChild(historyItem);
    });
}
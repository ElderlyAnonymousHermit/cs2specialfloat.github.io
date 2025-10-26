// ========== 主程序入口 ==========
document.addEventListener('DOMContentLoaded', function() {
    addMaterialGroup();
    loadUsageHistory();
    applyLanguage();
    
    calculateRequiredPercentage();
});

// 标签页切换
function openTab(tabName) {
    document.querySelectorAll('.tabcontent').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.tab button').forEach(btn => {
        btn.style.backgroundColor = '#374151';
    });
    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.style.backgroundColor = '#2563eb';
}

// 更新组合UI
function updateCombinationUI() {
    const combinationCount = parseInt(document.getElementById('combinationCount').value);
    console.log(`选择合成材料数量: ${combinationCount}`);
}

// 停止搜索
function stopSearch() {
    isSearching = false;
    document.querySelector('.btn-search').disabled = false;
    console.log('搜索已手动停止');
}

// 清空结果
function clearResults() {
    foundCombinations = [];
    document.getElementById('resultsList').innerHTML = '';
    updateResultsCount();
    
    document.querySelectorAll('.material-highlight, .percentage-highlight').forEach(el => {
        el.classList.remove('material-highlight', 'percentage-highlight');
    });
}

// 更新结果计数
function updateResultsCount() {
    const countText = currentLanguage === 'zh-CN' ? 
        `已找到 ${foundCombinations.length} 个组合` : 
        `Found ${foundCombinations.length} combinations`;
    document.getElementById('resultsCount').textContent = countText;
}

// 其他辅助函数...
function fcUpdateCombinations() {
    const allValues = getAllMaterialValues();
    console.log('当前所有材料组值:', allValues);
}



document.addEventListener('DOMContentLoaded', function() {
    addMaterialGroup();
    loadUsageHistory();
    applyLanguage();
    calculateRequiredPercentage();
    
    // 初始化推荐值监听器
    setTimeout(() => {
        setupWearValueListeners();
        updateAllWearValueSuggestions();
    }, 100);
});
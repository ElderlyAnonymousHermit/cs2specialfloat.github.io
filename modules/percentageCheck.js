// ========== 百分比检查功能 ==========
function calculateRequiredPercentage() {
    const productMinWear = getIEEE754(parseFloat(document.getElementById('productMinWear').value) || 0);
    const productMaxWear = getIEEE754(parseFloat(document.getElementById('productMaxWear').value) || 1);
    const targetProductWear = getIEEE754(parseFloat(document.getElementById('targetProductWear').value));
    
    if (productMinWear >= productMaxWear) {
        return;
    }
    
    const wearRange = getIEEE754(productMaxWear- productMinWear);
    const numerator = getIEEE754(targetProductWear- productMinWear);
    const requiredPercentage =getIEEE754(numerator/wearRange);
    
    document.getElementById('requiredPercentageValue').textContent = requiredPercentage;
    
    document.getElementById('percentageCheck').style.display = 'block';
    
    
}

function checkPercentageMatch() {
    calculateRequiredPercentage()
    // 重新读取产物最大磨损
    const productMinWear = getIEEE754(parseFloat(document.getElementById('productMinWear').value) || 0);
    const productMaxWear = getIEEE754(parseFloat(document.getElementById('productMaxWear').value) || 1);
    const targetProductWear = getIEEE754(parseFloat(document.getElementById('targetProductWear').value));
    const wearRange = getIEEE754(productMaxWear- productMinWear);
    const numerator = getIEEE754(targetProductWear- productMinWear);
    const requiredPercentage = getIEEE754(numerator/wearRange);
    
    const availablePercentages = getAllAvailablePercentages();
    
    if (availablePercentages.length === 0) {
        document.getElementById('averagePercentageValue').textContent = '0.0000';
        document.getElementById('percentageDifferenceValue').textContent = '0.0000%';
        
        const suggestion = document.getElementById('percentageSuggestion');
        suggestion.className = 'percentage-suggestion bad';
        suggestion.innerHTML = '<span data-i18n="noMaterials">❌ 没有可用的材料值，请先输入材料磨损值。</span>';
        applyLanguage();
        return;
    }
    
    let totalPercentage = 0;
    availablePercentages.forEach(percent => {
        totalPercentage = getIEEE754(totalPercentage+ percent.value);
    });
    
    const averagePercentage =getIEEE754(totalPercentage/getIEEE754(availablePercentages.length));
    
    let percentageDifference = 0;
    if (requiredPercentage > 0) {
        const absoluteDifference = Math.abs(getIEEE754(averagePercentage-requiredPercentage));
        percentageDifference =getIEEE754(absoluteDifference/requiredPercentage) * 100;
    } else {
        percentageDifference = Math.abs(averagePercentage) * 100;
    }
    
    document.getElementById('averagePercentageValue').textContent = averagePercentage;
    document.getElementById('percentageDifferenceValue').textContent = 
        percentageDifference.toFixed(4) + '%';
    
    const suggestion = document.getElementById('percentageSuggestion');
    
    if (percentageDifference <= 2) {
        suggestion.className = 'percentage-suggestion good';
        suggestion.innerHTML = '<span data-i18n="goodMatch">✅ 匹配度优秀！材料平均百分比与所需百分比差距很小，适合合成。</span>';
    } else if (percentageDifference <= 6.889) {
        suggestion.className = 'percentage-suggestion';
        suggestion.innerHTML = '<span data-i18n="acceptableMatch">⚠️ 匹配度可接受。材料平均百分比与所需百分比有一定差距，但仍可尝试合成。</span>';
    } else {
        suggestion.className = 'percentage-suggestion bad';
        suggestion.innerHTML = '<span data-i18n="poorMatch">❌ 匹配度较差。材料平均百分比与所需百分比差距较大，建议寻找更合适的材料。</span>';
    }
    
    applyLanguage();
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
        const maxWear = getIEEE754(parseFloat(maxWearInput.value) || 1);
        const range = getIEEE754(maxWear- minWear);
        
        if (range <= 0) return;
        
        materialInputs.forEach((input, inputIndex) => {
            const wearValue = getIEEE754(parseFloat(input.value));
            if (wearValue > 0 && !isNaN(wearValue) && wearValue >= minWear && wearValue <= maxWear) {
                const numerator = getIEEE754(wearValue-minWear);
                const percentage = getIEEE754(numerator/range);
                
                allPercentages.push({
                    groupId: parseInt(groupId),
                    inputIndex: inputIndex,
                    wearValue: wearValue,
                    value: percentage,
                    displayValue: percentage
                });
            }
        });
    });
    
    return allPercentages;
}
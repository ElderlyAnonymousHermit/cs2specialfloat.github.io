// ========== 百分比检查功能 ==========
function calculateRequiredPercentage() {
    const productMinWear = parseFloat(document.getElementById('productMinWear').value) || 0;
    const productMaxWear = parseFloat(document.getElementById('productMaxWear').value) || 1;
    const targetProductWear = parseFloat(document.getElementById('targetProductWear').value);
    
    if (productMinWear >= productMaxWear) {
        return;
    }
    
    const wearRange = IEEE754Float32.subtract(productMaxWear, productMinWear);
    const numerator = IEEE754Float32.subtract(targetProductWear, productMinWear);
    const requiredPercentage = IEEE754Float32.divide(numerator, wearRange);
    
    document.getElementById('requiredPercentageValue').textContent = 
        IEEE754Float32.formatPrecise(requiredPercentage);
    
    document.getElementById('percentageCheck').style.display = 'block';
    
    checkPercentageMatch();
}

function checkPercentageMatch() {
    const requiredPercentage = parseFloat(document.getElementById('requiredPercentageValue').textContent);
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
        totalPercentage = IEEE754Float32.add(totalPercentage, percent.value);
    });
    
    const averagePercentage = IEEE754Float32.divide(totalPercentage, availablePercentages.length);
    
    let percentageDifference = 0;
    if (requiredPercentage > 0) {
        const absoluteDifference = Math.abs(IEEE754Float32.subtract(averagePercentage, requiredPercentage));
        percentageDifference = IEEE754Float32.divide(absoluteDifference, requiredPercentage) * 100;
    } else {
        percentageDifference = Math.abs(averagePercentage) * 100;
    }
    
    document.getElementById('averagePercentageValue').textContent = 
        IEEE754Float32.formatPrecise(averagePercentage);
    document.getElementById('percentageDifferenceValue').textContent = 
        percentageDifference.toFixed(4) + '%';
    
    const suggestion = document.getElementById('percentageSuggestion');
    
    if (percentageDifference <= 5) {
        suggestion.className = 'percentage-suggestion good';
        suggestion.innerHTML = '<span data-i18n="goodMatch">✅ 匹配度优秀！材料平均百分比与所需百分比差距很小，适合合成。</span>';
    } else if (percentageDifference <= 13.6989) {
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
    
    return allPercentages;
}
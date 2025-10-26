// ========== 多语言支持 ==========
const translations = {
    'zh-CN': {
        'mainTab': '材料组合计算器',
        'language': 'English',
        'title': 'CSGO 材料组合计算器',
        'materialsPerGroup': '每组材料数量:',
        'addGroup': '添加材料组',
        'removeGroup': '删除材料组',
        'calculateAll': '计算所有百分比',
        'combinationCount': '合成材料数量:',
        'productMinWear': '产物最小磨损:',
        'productMaxWear': '产物最大磨损:',
        'targetProductWear': '期望产物磨损:',
        'significantDigits': '有效位数:',
        'decimalPlaces': '小数点后位数',
        'startSearch': '开始搜索组合',
        'stopSearch': '停止搜索',
        'requiredPercentage': '所需磨损百分比:',
        'averagePercentage': '材料平均百分比:',
        'percentageDifference': '百分比差距:',
        'checkMatch': '检查匹配度',
        'suggestionHint': '点击"检查匹配度"查看建议',
        'foundCombinations': '找到的组合结果',
        'foundCount': '已找到 0 个组合',
        'clearResults': '清空结果',
        'usageHistory': '使用记录',
        'clear': '清空',
        'noHistory': '暂无使用记录',
        'goodMatch': '✅ 匹配度优秀！材料平均百分比与所需百分比差距很小，适合合成。',
        'acceptableMatch': '⚠️ 匹配度可接受。材料平均百分比与所需百分比有一定差距，但仍可尝试合成。',
        'poorMatch': '❌ 匹配度较差。材料平均百分比与所需百分比差距较大，建议寻找更合适的材料。',
        'noMaterials': '❌ 没有可用的材料值，请先输入材料磨损值。'
    },
    'en': {
        'mainTab': 'Material Combination Calculator',
        'language': '中文',
        'title': 'CSGO Material Combination Calculator',
        'materialsPerGroup': 'Materials per group:',
        'addGroup': 'Add Material Group',
        'removeGroup': 'Remove Material Group',
        'calculateAll': 'Calculate All Percentages',
        'combinationCount': 'Combination count:',
        'productMinWear': 'Product min wear:',
        'productMaxWear': 'Product max wear:',
        'targetProductWear': 'Target product wear:',
        'significantDigits': 'Significant digits:',
        'decimalPlaces': 'decimal places',
        'startSearch': 'Start Combination Search',
        'stopSearch': 'Stop Search',
        'requiredPercentage': 'Required wear percentage:',
        'averagePercentage': 'Average material percentage:',
        'percentageDifference': 'Percentage difference:',
        'checkMatch': 'Check Match',
        'suggestionHint': 'Click "Check Match" for suggestions',
        'foundCombinations': 'Found Combinations',
        'foundCount': 'Found 0 combinations',
        'clearResults': 'Clear Results',
        'usageHistory': 'Usage History',
        'clear': 'Clear',
        'noHistory': 'No usage history',
        'goodMatch': '✅ Excellent match! The average material percentage is very close to the required percentage, suitable for crafting.',
        'acceptableMatch': '⚠️ Acceptable match. There is some difference between average material percentage and required percentage, but still worth trying.',
        'poorMatch': '❌ Poor match. The average material percentage differs significantly from the required percentage, suggest finding better materials.',
        'noMaterials': '❌ No available material values, please input material wear values first.'
    }
};

let currentLanguage = 'zh-CN';

function toggleLanguage() {
    currentLanguage = currentLanguage === 'zh-CN' ? 'en' : 'zh-CN';
    applyLanguage();
}

function applyLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    const languageButton = document.querySelector('.language-switcher');
    if (languageButton) {
        const span = languageButton.querySelector('span');
        if (span) {
            span.textContent = translations[currentLanguage]['language'];
        }
    }
    
    updateResultsCount();
}

document.addEventListener('DOMContentLoaded', function() {
    applyLanguage();
});
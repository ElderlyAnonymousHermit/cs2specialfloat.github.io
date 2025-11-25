// 材料查找器模块
let skinData = []; // 存储皮肤数据
let searchTimeout = null;

// 初始化材料查找器
async function initMaterialFinder() {
    try {
        // 加载外部JSON文件
        const response = await fetch('collections_cn.json');
        if (!response.ok) {
            throw new Error('无法加载皮肤数据');
        }
        skinData = await response.json();
        
        populateCollectionSelect();
        populateQualitySelect();
        console.log('皮肤数据加载成功，共', skinData.length, '个收藏品');
    } catch (error) {
        console.error('加载皮肤数据失败:', error);
        alert('加载皮肤数据失败，请刷新页面重试');
    }
}

// 填充收藏品选择框
function populateCollectionSelect() {
    const collectionSelect = document.getElementById('collectionSelect');
    collectionSelect.innerHTML = '<option value="">请选择收藏品...</option>';
    
    skinData.forEach(collection => {
        const option = document.createElement('option');
        option.value = collection.name;
        option.textContent = collection.localizedName || collection.name;
        collectionSelect.appendChild(option);
    });
}

// 填充品质选择框
function populateQualitySelect() {
    const qualitySelect = document.getElementById('qualitySelect');
    qualitySelect.innerHTML = '<option value="">请选择品质...</option>';
    
    // 所有可能的品质等级
    const qualities = [
        { value: '1', text: '消费级' },
        { value: '2', text: '工业级' },
        { value: '3', text: '军规级' },
        { value: '4', text: '军规级' },
        { value: '5', text: '受限' },
        { value: '6', text: '受限' },
        { value: '7', text: '保密' },
        { value: '8', text: '保密' },
        { value: '9', text: '隐秘' },
        { value: '10', text: '隐秘' },
        { value: '12', text: '★' }
    ];
    
    qualities.forEach(quality => {
        const option = document.createElement('option');
        option.value = quality.value;
        option.textContent = quality.text;
        qualitySelect.appendChild(option);
    });
}

// 切换查找方式
function switchFinderMethod(method) {
    const filterSection = document.getElementById('filterSection');
    const searchSection = document.getElementById('searchSection');
    const filterTab = document.getElementById('filterMethodTab');
    const searchTab = document.getElementById('searchMethodTab');
    
    if (method === 'filter') {
        filterSection.style.display = 'block';
        searchSection.style.display = 'none';
        filterTab.classList.add('active');
        searchTab.classList.remove('active');
    } else {
        filterSection.style.display = 'none';
        searchSection.style.display = 'block';
        filterTab.classList.remove('active');
        searchTab.classList.add('active');
    }
}

// 收藏品选择变化
function onCollectionChange() {
    const collectionSelect = document.getElementById('collectionSelect');
    const qualitySelect = document.getElementById('qualitySelect');
    const skinSelect = document.getElementById('skinSelect');
    
    skinSelect.innerHTML = '<option value="">请先选择品质...</option>';
    
    if (collectionSelect.value && qualitySelect.value) {
        updateSkinSelect();
    }
}

// 品质选择变化
function onQualityChange() {
    const collectionSelect = document.getElementById('collectionSelect');
    const skinSelect = document.getElementById('skinSelect');
    
    skinSelect.innerHTML = '<option value="">请先选择收藏品...</option>';
    
    if (collectionSelect.value) {
        updateSkinSelect();
    }
}

// 更新皮肤选择框
function updateSkinSelect() {
    const collectionSelect = document.getElementById('collectionSelect');
    const qualitySelect = document.getElementById('qualitySelect');
    const skinSelect = document.getElementById('skinSelect');
    
    const selectedCollection = collectionSelect.value;
    const selectedQuality = qualitySelect.value;
    
    const collection = skinData.find(item => item.name === selectedCollection);
    if (collection && collection.products) {
        const skins = collection.products.filter(product => 
            product.numericQuality.toString() === selectedQuality
        );
        
        skinSelect.innerHTML = '<option value="">选择皮肤...</option>';
        skins.forEach(skin => {
            const option = document.createElement('option');
            option.value = skin.name;
            option.textContent = skin.localizedName || skin.name;
            option.dataset.skinData = JSON.stringify(skin);
            skinSelect.appendChild(option);
        });
        
        if (skins.length === 0) {
            skinSelect.innerHTML = '<option value="">该品质下无可用皮肤</option>';
        }
    }
}

// 皮肤搜索输入处理
function onSkinSearchInput() {
    const searchInput = document.getElementById('skinSearchInput');
    const suggestions = document.getElementById('searchSuggestions');
    
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm.length < 2) {
            suggestions.style.display = 'none';
            return;
        }
        
        const matchedSkins = [];
        
        // 在所有收藏品中搜索匹配的皮肤
        skinData.forEach(collection => {
            if (collection.products) {
                collection.products.forEach(skin => {
                    if ((skin.localizedName && skin.localizedName.toLowerCase().includes(searchTerm)) || 
                        (skin.name && skin.name.toLowerCase().includes(searchTerm))) {
                        matchedSkins.push({
                            ...skin,
                            collectionName: collection.localizedName || collection.name
                        });
                    }
                });
            }
        });
        
        displaySearchSuggestions(matchedSkins);
    }, 300);
}

// 显示搜索建议
function displaySearchSuggestions(skins) {
    const suggestions = document.getElementById('searchSuggestions');
    suggestions.innerHTML = '';
    
    if (skins.length === 0) {
        suggestions.style.display = 'none';
        return;
    }
    
    // 限制显示数量并排序（按匹配度）
    skins.slice(0, 8).forEach(skin => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'search-suggestion-item';
        suggestionItem.innerHTML = `
            <div style="font-weight: bold;">${skin.localizedName || skin.name}</div>
            <div style="font-size: 12px; color: #9ca3af;">${skin.collectionName} • ${skin.localizedQuality || skin.quality}</div>
        `;
        suggestionItem.dataset.skinData = JSON.stringify(skin);
        
        suggestionItem.addEventListener('click', () => {
            document.getElementById('skinSearchInput').value = skin.localizedName || skin.name;
            suggestions.style.display = 'none';
        });
        
        suggestions.appendChild(suggestionItem);
    });
    
    suggestions.style.display = 'block';
}

// 点击页面其他区域隐藏搜索建议
document.addEventListener('click', function(e) {
    const suggestions = document.getElementById('searchSuggestions');
    const searchInput = document.getElementById('skinSearchInput');
    
    if (e.target !== searchInput && !suggestions.contains(e.target)) {
        suggestions.style.display = 'none';
    }
});

// 通过筛选器查找材料
function findMaterialByFilter() {
    const skinSelect = document.getElementById('skinSelect');
    const selectedOption = skinSelect.options[skinSelect.selectedIndex];
    
    if (!selectedOption.value) {
        alert('请选择要查找的皮肤！');
        return;
    }
    
    try {
        const skinData = JSON.parse(selectedOption.dataset.skinData);
        displayMaterialResults(skinData);
    } catch (error) {
        console.error('解析皮肤数据失败:', error);
        alert('数据解析失败，请重新选择');
    }
}

// 通过搜索查找材料
function findMaterialBySearch() {
    const searchInput = document.getElementById('skinSearchInput');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        alert('请输入要搜索的皮肤名称！');
        return;
    }
    
    // 在所有收藏品中查找精确匹配的皮肤
    let foundSkin = null;
    
    for (const collection of skinData) {
        if (collection.products) {
            for (const skin of collection.products) {
                if ((skin.localizedName && skin.localizedName === searchTerm) || 
                    (skin.name && skin.name === searchTerm)) {
                    foundSkin = {
                        ...skin,
                        collectionName: collection.localizedName || collection.name
                    };
                    break;
                }
            }
        }
        if (foundSkin) break;
    }
    
    if (foundSkin) {
        displayMaterialResults(foundSkin);
    } else {
        // 如果没有精确匹配，显示模糊匹配的结果
        const matchedSkins = [];
        skinData.forEach(collection => {
            if (collection.products) {
                collection.products.forEach(skin => {
                    if ((skin.localizedName && skin.localizedName.toLowerCase().includes(searchTerm.toLowerCase())) || 
                        (skin.name && skin.name.toLowerCase().includes(searchTerm.toLowerCase()))) {
                        matchedSkins.push({
                            ...skin,
                            collectionName: collection.localizedName || collection.name
                        });
                    }
                });
            }
        });
        
        if (matchedSkins.length === 1) {
            displayMaterialResults(matchedSkins[0]);
        } else if (matchedSkins.length > 1) {
            alert(`找到 ${matchedSkins.length} 个匹配的皮肤，请更精确地输入皮肤名称`);
        } else {
            alert('未找到匹配的皮肤！');
        }
    }
}

// 显示材料结果
function displayMaterialResults(targetSkin) {
    const finderResults = document.getElementById('finderResults');
    const targetItemInfo = document.getElementById('targetItemInfo');
    const materialsGrid = document.getElementById('materialsGrid');
    
    // 显示目标物品信息
    targetItemInfo.innerHTML = `
        <div class="target-item-header">
            <div class="target-item-image">${getSkinEmoji(targetSkin)}</div>
            <div class="target-item-details">
                <div class="target-item-name">${targetSkin.localizedName || targetSkin.name}</div>
                <div class="target-item-collection">${targetSkin.collectionName || '未知收藏品'}</div>
                <div class="target-item-quality">品质: ${targetSkin.localizedQuality || targetSkin.quality}</div>
                <div class="target-item-wear">
                    磨损范围: ${formatWear(targetSkin.minWear)} - ${formatWear(targetSkin.maxWear)}
                    ${targetSkin.minWear > 0 || targetSkin.maxWear < 1 ? `(区间: ${formatWear(targetSkin.maxWear - targetSkin.minWear)})` : ''}
                </div>
                <div class="target-item-tradeup">
                    能否合成: ${targetSkin.tradeUp ? '✅ 可以' : '❌ 不可以'}
                </div>
            </div>
        </div>
    `;
    
    // 查找下级材料
    const lowerMaterials = findLowerQualityMaterials(targetSkin);
    
    materialsGrid.innerHTML = '';
    
    if (lowerMaterials.length === 0) {
        materialsGrid.innerHTML = '<div class="no-materials">未找到下级材料</div>';
    } else {
        lowerMaterials.forEach(material => {
            const materialCard = createMaterialCard(material);
            materialsGrid.appendChild(materialCard);
        });
    }
    
    finderResults.style.display = 'block';
    
    // 滚动到结果区域
    finderResults.scrollIntoView({ behavior: 'smooth' });
}

// 查找低品质材料（下级材料）
function findLowerQualityMaterials(targetSkin) {
    const lowerMaterials = [];
    const targetQuality = targetSkin.numericQuality;
    
    // 定义品质层级关系
    const qualityHierarchy = {
        12: [10, 8, 6, 4, 2, 1], // ★ -> 隐秘/保密/受限/军规/工业/消费
        10: [8, 6, 4, 2, 1],     // 隐秘 -> 保密/受限/军规/工业/消费
        8: [6, 4, 2, 1],         // 保密 -> 受限/军规/工业/消费
        6: [4, 2, 1],            // 受限 -> 军规/工业/消费
        4: [2, 1],               // 军规 -> 工业/消费
        2: [1],                  // 工业 -> 消费
        1: []                    // 消费 -> 无下级
    };
    
    const targetQualities = qualityHierarchy[targetQuality] || [];
    
    skinData.forEach(collection => {
        if (collection.products) {
            collection.products.forEach(skin => {
                if (targetQualities.includes(skin.numericQuality) && 
                    skin.tradeUp === true) { // 只显示可以用于合成的材料
                    lowerMaterials.push({
                        ...skin,
                        collectionName: collection.localizedName || collection.name
                    });
                }
            });
        }
    });
    
    return lowerMaterials;
}

// 创建材料卡片
function createMaterialCard(material) {
    const card = document.createElement('div');
    card.className = 'material-card';
    
    card.innerHTML = `
        <div class="material-header">
            <div class="material-image">${getSkinEmoji(material)}</div>
            <div class="material-info">
                <div class="material-name">${material.localizedName || material.name}</div>
                <div class="material-quality">${material.localizedQuality || material.quality} | ${material.collectionName}</div>
            </div>
        </div>
        <div class="material-wear-range">
            <div class="wear-range-item">
                <span class="wear-label">最小磨损:</span>
                <span class="wear-value">${formatWear(material.minWear)}</span>
            </div>
            <div class="wear-range-item">
                <span class="wear-label">最大磨损:</span>
                <span class="wear-value">${formatWear(material.maxWear)}</span>
            </div>
            <div class="wear-range-item">
                <span class="wear-label">磨损区间:</span>
                <span class="wear-value">${formatWear(material.maxWear - material.minWear)}</span>
            </div>
            <div class="wear-range-item">
                <span class="wear-label">能否合成:</span>
                <span class="wear-value">${material.tradeUp ? '✅' : '❌'}</span>
            </div>
        </div>
    `;
    
    return card;
}

// 获取皮肤对应的emoji
function getSkinEmoji(skin) {
    const skinName = skin.name || '';
    if (skinName.includes('Knife') || skinName.includes('★')) {
        return '🔪';
    } else if (skinName.includes('Glove')) {
        return '🧤';
    } else if (skinName.includes('AWP')) {
        return '🎯';
    } else if (skinName.includes('AK-47')) {
        return '🔫';
    } else if (skinName.includes('M4')) {
        return '🔫';
    } else if (skinName.includes('Desert Eagle')) {
        return '🔫';
    } else {
        return '🔫';
    }
}

// 格式化磨损值显示
function formatWear(wear) {
    if (wear === 0) return '0.000000';
    if (wear === 1) return '1.000000';
    return wear.toFixed(6).replace(/\.?0+$/, '');
}

// 在页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 在标签页切换时初始化材料查找器
    setTimeout(initMaterialFinder, 100);
});
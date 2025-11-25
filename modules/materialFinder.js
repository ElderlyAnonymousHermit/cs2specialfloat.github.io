// modules/materialFinder.js
let appSkinData = []; // 重命名变量避免冲突
let searchTimeout = null;

// 初始化材料查找器
function initMaterialFinder() {
    console.log('开始初始化材料查找器...');
    
    try {
        // 使用重命名的变量
        if (typeof skinData !== 'undefined' && Array.isArray(skinData)) {
            appSkinData = skinData; // 将全局的skinData赋值给局部变量
            console.log('皮肤数据加载成功，共', appSkinData.length, '个收藏品');
            
            populateCollectionSelect();
            populateQualitySelect();
            
            // 禁用输入框的浏览器自动完成
            const searchInput = document.getElementById('skinSearchInput');
            if (searchInput) {
                searchInput.setAttribute('autocomplete', 'off');
                searchInput.setAttribute('autocorrect', 'off');
                searchInput.setAttribute('autocapitalize', 'off');
                searchInput.setAttribute('spellcheck', 'false');
            }
            
            console.log('材料查找器初始化完成');
            showNotification('皮肤数据加载成功！', 'success');
        } else {
            throw new Error('skinData 未定义或不是数组');
        }
        
    } catch (error) {
        console.error('初始化材料查找器失败:', error);
        showNotification('皮肤数据加载失败: ' + error.message, 'error');
    }
}

// 显示通知函数
function showNotification(message, type) {
    // 移除现有的通知
    const existingNotification = document.getElementById('materialFinderNotification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'materialFinderNotification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// 填充收藏品选择框
function populateCollectionSelect() {
    const collectionSelect = document.getElementById('collectionSelect');
    if (!collectionSelect) return;
    
    collectionSelect.innerHTML = '<option value="">请选择收藏品（可选）...</option>';
    
    appSkinData.forEach(collection => {
        const option = document.createElement('option');
        option.value = collection.name;
        option.textContent = collection.localizedName || collection.name;
        collectionSelect.appendChild(option);
    });
}

// 填充品质选择框
function populateQualitySelect() {
    const qualitySelect = document.getElementById('qualitySelect');
    if (!qualitySelect) return;
    
    qualitySelect.innerHTML = '<option value="">请选择品质...</option>';
    
    // 去重后的品质等级
    const uniqueQualities = [
        { value: '1', text: '消费级' },
        { value: '2', text: '工业级' },
        { value: '3', text: '军规级' },
        { value: '5', text: '受限' },
        { value: '7', text: '保密' },
        { value: '9', text: '隐秘' },
        { value: '12', text: '★' }
    ];
    
    uniqueQualities.forEach(quality => {
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
    
    if (!filterSection || !searchSection || !filterTab || !searchTab) return;
    
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
    updateSkinSelect();
}

// 品质选择变化
function onQualityChange() {
    updateSkinSelect();
}

// 更新皮肤选择框
function updateSkinSelect() {
    const collectionSelect = document.getElementById('collectionSelect');
    const qualitySelect = document.getElementById('qualitySelect');
    const skinSelect = document.getElementById('skinSelect');
    
    if (!collectionSelect || !qualitySelect || !skinSelect) return;
    
    const selectedCollection = collectionSelect.value;
    const selectedQuality = qualitySelect.value;
    
    skinSelect.innerHTML = '<option value="">选择皮肤...</option>';
    
    if (!selectedQuality) {
        skinSelect.innerHTML = '<option value="">请先选择品质...</option>';
        return;
    }
    
    // 查找所有匹配的皮肤
    const allSkins = [];
    
    appSkinData.forEach(collection => {
        // 如果选择了收藏品，只在该收藏品中查找；否则在所有收藏品中查找
        if (!selectedCollection || collection.name === selectedCollection) {
            if (collection.products) {
                // 查找所有匹配的品质数值（包括变体）
                const qualityVariants = getQualityVariants(parseInt(selectedQuality));
                const skins = collection.products.filter(product => 
                    qualityVariants.includes(product.numericQuality)
                );
                
                skins.forEach(skin => {
                    allSkins.push({
                        ...skin,
                        collectionName: collection.localizedName || collection.name
                    });
                });
            }
        }
    });
    
    // 按皮肤名称排序
    allSkins.sort((a, b) => (a.localizedName || a.name).localeCompare(b.localizedName || b.name));
    
    allSkins.forEach(skin => {
        const option = document.createElement('option');
        option.value = skin.name;
        
        // 检查是否是最低级别
        const isLowestGrade = isLowestGradeSkin(skin);
        const lowestText = isLowestGrade ? ' (最低级别)' : '';
        
        option.textContent = `${skin.localizedName || skin.name} - ${skin.collectionName}${lowestText}`;
        option.dataset.skinData = JSON.stringify(skin);
        option.dataset.isLowestGrade = isLowestGrade;
        
        skinSelect.appendChild(option);
    });
    
    if (allSkins.length === 0) {
        skinSelect.innerHTML = '<option value="">未找到匹配的皮肤</option>';
    }
}

// 判断是否是最低级别皮肤
function isLowestGradeSkin(skin) {
    const targetQuality = skin.numericQuality;
    
    // 定义最低级别
    const lowestGrades = [1]; // 消费级是最低级别
    
    return lowestGrades.includes(targetQuality);
}

// 皮肤选择变化 - 自动查找下级材料
function onSkinSelectChange() {
    const skinSelect = document.getElementById('skinSelect');
    const selectedOption = skinSelect.options[skinSelect.selectedIndex];
    
    if (!selectedOption || !selectedOption.value) return;
    
    try {
        const skinData = JSON.parse(selectedOption.dataset.skinData);
        const isLowestGrade = selectedOption.dataset.isLowestGrade === 'true';
        
        if (isLowestGrade) {
            // 如果是最低级别，显示提示信息
            displayLowestGradeMessage(skinData);
        } else {
            // 不是最低级别，正常显示下级材料
            displayMaterialResults(skinData);
        }
    } catch (error) {
        console.error('解析皮肤数据失败:', error);
    }
}

// 显示最低级别提示信息
function displayLowestGradeMessage(skin) {
    const finderResults = document.getElementById('finderResults');
    const targetItemInfo = document.getElementById('targetItemInfo');
    const materialsGrid = document.getElementById('materialsGrid');
    
    if (!finderResults || !targetItemInfo || !materialsGrid) return;
    
    // 显示目标物品信息
    targetItemInfo.innerHTML = `
        <div class="target-item-header">
            <div class="target-item-image">${getSkinEmoji(skin)}</div>
            <div class="target-item-details">
                <div class="target-item-name">${skin.localizedName || skin.name}</div>
                <div class="target-item-collection">${skin.collectionName || '未知收藏品'}</div>
                <div class="target-item-quality">品质: ${skin.localizedQuality || skin.quality} (${skin.numericQuality})</div>
                <div class="target-item-wear">
                    磨损范围: ${formatWear(skin.minWear)} - ${formatWear(skin.maxWear)}
                    ${skin.minWear > 0 || skin.maxWear < 1 ? `(区间: ${formatWear(skin.maxWear - skin.minWear)})` : ''}
                </div>
                <div class="target-item-tradeup">
                    能否合成: ${skin.tradeUp ? '✅ 可以' : '❌ 不可以'}
                </div>
                <div class="target-item-lowest" style="color: #f59e0b; margin-top: 10px;">
                    ⚠️ 这是最低级别皮肤，没有下级材料
                </div>
            </div>
        </div>
        <div class="target-item-actions" style="margin-top: 15px;">
            <button class="btn-export" onclick="exportSameWearSkins('${skin.name}')" style="margin-right: 10px;">
                📋 导出相同磨损同等级皮肤
            </button>
            <button class="btn-export" onclick="exportLowerMaxWearSkins('${skin.name}')">
                📋 导出低磨损同等级皮肤
            </button>
        </div>
    `;
    
    materialsGrid.innerHTML = '<div class="no-materials">这是最低级别皮肤，没有下级材料</div>';
    finderResults.style.display = 'block';
    finderResults.scrollIntoView({ behavior: 'smooth' });
}

// 获取品质数值的所有变体
function getQualityVariants(quality) {
    const qualityVariants = {
        1: [1],
        2: [2],
        3: [3, 4],    // 军规级
        5: [5, 6],    // 受限
        7: [7, 8],    // 保密
        9: [9, 10],   // 隐秘
        12: [12]      // ★
    };
    return qualityVariants[quality] || [quality];
}

// 皮肤搜索输入处理
function onSkinSearchInput() {
    const searchInput = document.getElementById('skinSearchInput');
    const suggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput || !suggestions) return;
    
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm.length < 2) {
            suggestions.style.display = 'none';
            return;
        }
        
        const matchedSkins = [];
        
        // 在所有收藏品中搜索匹配的皮肤
        appSkinData.forEach(collection => {
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
    const searchInput = document.getElementById('skinSearchInput');
    
    if (!suggestions || !searchInput) return;
    
    suggestions.innerHTML = '';
    
    if (skins.length === 0) {
        suggestions.style.display = 'none';
        return;
    }
    
    // 确保搜索建议框的位置正确
    const inputRect = searchInput.getBoundingClientRect();
    suggestions.style.width = inputRect.width + 'px';
    suggestions.style.left = '0';
    suggestions.style.top = '100%';
    
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
            
            // 自动查找
            setTimeout(() => {
                findMaterialBySearch();
            }, 100);
        });
        
        suggestions.appendChild(suggestionItem);
    });
    
    suggestions.style.display = 'block';
    suggestions.style.zIndex = '1001';
}

// 点击页面其他区域隐藏搜索建议
document.addEventListener('click', function(e) {
    const suggestions = document.getElementById('searchSuggestions');
    const searchInput = document.getElementById('skinSearchInput');
    
    if (!suggestions || !searchInput) return;
    
    if (e.target !== searchInput && !suggestions.contains(e.target)) {
        suggestions.style.display = 'none';
    }
});

// 通过筛选器查找材料 - 现在由选择变化自动触发
function findMaterialByFilter() {
    // 这个函数现在保留给其他可能的调用
    const skinSelect = document.getElementById('skinSelect');
    const selectedOption = skinSelect.options[skinSelect.selectedIndex];
    
    if (!selectedOption || !selectedOption.value) {
        alert('请选择要查找的皮肤！');
        return;
    }
    
    try {
        const skinData = JSON.parse(selectedOption.dataset.skinData);
        const isLowestGrade = selectedOption.dataset.isLowestGrade === 'true';
        
        if (isLowestGrade) {
            displayLowestGradeMessage(skinData);
        } else {
            displayMaterialResults(skinData);
        }
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
    
    for (const collection of appSkinData) {
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
        const isLowestGrade = isLowestGradeSkin(foundSkin);
        if (isLowestGrade) {
            displayLowestGradeMessage(foundSkin);
        } else {
            displayMaterialResults(foundSkin);
        }
    } else {
        // 如果没有精确匹配，显示模糊匹配的结果
        const matchedSkins = [];
        appSkinData.forEach(collection => {
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
            const isLowestGrade = isLowestGradeSkin(matchedSkins[0]);
            if (isLowestGrade) {
                displayLowestGradeMessage(matchedSkins[0]);
            } else {
                displayMaterialResults(matchedSkins[0]);
            }
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
    
    // 添加安全检查
    if (!finderResults || !targetItemInfo || !materialsGrid) {
        console.error('找不到必要的DOM元素:', {
            finderResults: !!finderResults,
            targetItemInfo: !!targetItemInfo,
            materialsGrid: !!materialsGrid
        });
        alert('页面元素加载异常，请刷新页面重试');
        return;
    }
    
    // 找到目标皮肤所在的收藏品
    const targetCollection = findCollectionBySkin(targetSkin);
    
    // 显示目标物品信息
    targetItemInfo.innerHTML = `
        <div class="target-item-header">
            <div class="target-item-image">${getSkinEmoji(targetSkin)}</div>
            <div class="target-item-details">
                <div class="target-item-name">${targetSkin.localizedName || targetSkin.name}</div>
                <div class="target-item-collection">${targetCollection ? targetCollection.localizedName : '未知收藏品'}</div>
                <div class="target-item-quality">品质: ${targetSkin.localizedQuality || targetSkin.quality} (${targetSkin.numericQuality})</div>
                <div class="target-item-wear">
                    磨损范围: ${formatWear(targetSkin.minWear)} - ${formatWear(targetSkin.maxWear)}
                    ${targetSkin.minWear > 0 || targetSkin.maxWear < 1 ? `(区间: ${formatWear(targetSkin.maxWear - targetSkin.minWear)})` : ''}
                </div>
                <div class="target-item-tradeup">
                    能否合成: ${targetSkin.tradeUp ? '✅ 可以' : '❌ 不可以'}
                </div>
            </div>
        </div>
        <div class="target-item-actions" style="margin-top: 15px;">
            <button class="btn-export" onclick="exportSameWearSkins('${targetSkin.name}')" style="margin-right: 10px;">
                📋 导出相同磨损同等级皮肤
            </button>
            <button class="btn-export" onclick="exportLowerMaxWearSkins('${targetSkin.name}')">
                📋 导出低磨损同等级皮肤
            </button>
        </div>
    `;
    
    // 查找下级材料
    const lowerMaterials = findLowerQualityMaterials(targetSkin, targetCollection);
    
    materialsGrid.innerHTML = '';
    
    if (lowerMaterials.length === 0) {
        materialsGrid.innerHTML = '<div class="no-materials">未找到下级材料</div>';
    } else {
        // 按同收藏品和其他收藏品分组
        const sameCollection = lowerMaterials.filter(m => m.fromSameCollection);
        const otherCollections = lowerMaterials.filter(m => !m.fromSameCollection);
        
        if (sameCollection.length > 0) {
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'materials-section-header';
            sectionHeader.innerHTML = `<h4>🎯 同收藏品下级材料 (${sameCollection.length}个)</h4>`;
            materialsGrid.appendChild(sectionHeader);
            
            sameCollection.forEach(material => {
                const materialCard = createMaterialCard(material, true);
                materialsGrid.appendChild(materialCard);
            });
        }
        
        if (otherCollections.length > 0) {
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'materials-section-header';
            sectionHeader.innerHTML = `<h4>🔗 其他收藏品可合成材料 (${otherCollections.length}个)</h4>`;
            materialsGrid.appendChild(sectionHeader);
            
            otherCollections.forEach(material => {
                const materialCard = createMaterialCard(material, false);
                materialsGrid.appendChild(materialCard);
            });
        }
    }
    
    finderResults.style.display = 'block';
    
    // 滚动到结果区域
    finderResults.scrollIntoView({ behavior: 'smooth' });
}

// 导出相同磨损的同等级皮肤
function exportSameWearSkins(skinName) {
    const targetSkin = findSkinByName(skinName);
    if (!targetSkin) return;
    
    const sameGradeSkins = findSameGradeSkins(targetSkin, true, false);
    displayExportResults(sameGradeSkins, `相同磨损的同等级皮肤 (${targetSkin.localizedName || targetSkin.name})`);
}

// 导出最大磨损低于该皮肤的同等级皮肤
function exportLowerMaxWearSkins(skinName) {
    const targetSkin = findSkinByName(skinName);
    if (!targetSkin) return;
    
    const lowerWearSkins = findSameGradeSkins(targetSkin, false, true);
    displayExportResults(lowerWearSkins, `低磨损的同等级皮肤 (最大磨损 ≤ ${formatWear(targetSkin.maxWear)})`);
}

// 查找同等级皮肤
function findSameGradeSkins(targetSkin, sameWear, lowerMaxWear) {
    const targetQuality = targetSkin.numericQuality;
    const qualityVariants = getQualityVariants(targetQuality);
    const results = [];
    
    appSkinData.forEach(collection => {
        if (collection.products) {
            collection.products.forEach(skin => {
                // 同等级且可合成
                if (qualityVariants.includes(skin.numericQuality) && skin.tradeUp) {
                    let shouldInclude = true;
                    
                    if (sameWear) {
                        // 相同磨损范围
                        shouldInclude = skin.minWear === targetSkin.minWear && skin.maxWear === targetSkin.maxWear;
                    } else if (lowerMaxWear) {
                        // 最大磨损低于目标皮肤
                        shouldInclude = skin.maxWear <= targetSkin.maxWear;
                    }
                    
                    if (shouldInclude && skin.name !== targetSkin.name) {
                        results.push({
                            ...skin,
                            collectionName: collection.localizedName || collection.name
                        });
                    }
                }
            });
        }
    });
    
    return results;
}

// 显示导出结果
function displayExportResults(skins, title) {
    if (skins.length === 0) {
        alert('未找到符合条件的皮肤');
        return;
    }
    
    let output = `${title}\n\n`;
    skins.forEach(skin => {
        output += `名称: ${skin.localizedName || skin.name}\n`;
        output += `收藏品: ${skin.collectionName}\n`;
        output += `磨损: ${formatWear(skin.minWear)} - ${formatWear(skin.maxWear)}\n`;
        output += `品质: ${skin.localizedQuality || skin.quality}\n`;
        output += `----------------------------------------\n`;
    });
    
    output += `\n总计: ${skins.length} 个皮肤`;
    
    // 创建弹窗显示结果
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1f2937;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #374151;
        z-index: 10000;
        max-width: 80%;
        max-height: 80%;
        overflow: auto;
        color: white;
    `;
    
    modal.innerHTML = `
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #60a5fa;">导出结果</h3>
            <button onclick="this.parentElement.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">关闭</button>
        </div>
        <pre style="white-space: pre-wrap; font-family: monospace; background: #374151; padding: 15px; border-radius: 4px;">${output}</pre>
        <button onclick="copyToClipboard(this.previousElementSibling.textContent)" style="background: #10b981; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-top: 10px;">复制到剪贴板</button>
    `;
    
    document.body.appendChild(modal);
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪贴板！');
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    });
}

// 根据皮肤名称查找皮肤
function findSkinByName(skinName) {
    for (const collection of appSkinData) {
        if (collection.products) {
            const found = collection.products.find(skin => skin.name === skinName);
            if (found) {
                return {
                    ...found,
                    collectionName: collection.localizedName || collection.name
                };
            }
        }
    }
    return null;
}

// 查找低品质材料（下级材料）
function findLowerQualityMaterials(targetSkin, targetCollection) {
    const lowerMaterials = [];
    const targetQuality = targetSkin.numericQuality;
    
    // 定义品质层级关系（包含所有可能的数值）
    const qualityHierarchy = {
        // ★ -> 隐秘
        12: [9, 10],
        // 隐秘 -> 保密
        9: [7, 8],
        10: [7, 8],
        // 保密 -> 受限
        7: [5, 6],
        8: [5, 6],
        // 受限 -> 军规
        5: [3, 4],
        6: [3, 4],
        // 军规 -> 工业
        3: [2],
        4: [2],
        // 工业 -> 消费
        2: [1],
        // 消费 -> 无下级
        1: []
    };
    
    const targetQualities = qualityHierarchy[targetQuality] || [];
    
    // 首先查找同收藏品的下级材料
    const sameCollectionMaterials = findMaterialsInCollection(targetCollection, targetQualities);
    lowerMaterials.push(...sameCollectionMaterials);
    
    // 如果是刀或手套，还需要查找其他可能合成它的收藏品
    if (isKnifeOrGlove(targetSkin)) {
        const otherCollectionMaterials = findMaterialsInOtherCollections(targetSkin, targetQualities);
        lowerMaterials.push(...otherCollectionMaterials);
    }
    
    return lowerMaterials;
}

// 在同收藏品中查找材料
function findMaterialsInCollection(collection, targetQualities) {
    const materials = [];
    
    if (collection && collection.products) {
        collection.products.forEach(skin => {
            if (targetQualities.includes(skin.numericQuality) && 
                skin.tradeUp === true) {
                materials.push({
                    ...skin,
                    collectionName: collection.localizedName || collection.name,
                    fromSameCollection: true
                });
            }
        });
    }
    
    return materials;
}

// 在其他收藏品中查找可以合成该刀/手套的材料
function findMaterialsInOtherCollections(targetSkin, targetQualities) {
    const materials = [];
    
    // 查找所有收藏品中可能合成这个刀/手套的隐秘级皮肤
    appSkinData.forEach(collection => {
        if (collection.products) {
            collection.products.forEach(skin => {
                // 如果是隐秘级且可以合成，且不是同收藏品
                if ((skin.numericQuality === 9 || skin.numericQuality === 10) && 
                    skin.tradeUp === true &&
                    !materials.some(m => m.name === skin.name)) {
                    materials.push({
                        ...skin,
                        collectionName: collection.localizedName || collection.name,
                        fromSameCollection: false,
                        canCraftTarget: true
                    });
                }
            });
        }
    });
    
    return materials;
}

// 判断是否是刀或手套
function isKnifeOrGlove(skin) {
    const skinName = skin.name || '';
    return skinName.includes('Knife') || skinName.includes('Glove') || skinName.includes('★');
}

// 根据皮肤找到对应的收藏品
function findCollectionBySkin(skin) {
    for (const collection of appSkinData) {
        if (collection.products) {
            const found = collection.products.find(s => s.name === skin.name);
            if (found) {
                return collection;
            }
        }
    }
    return null;
}

// 创建材料卡片
function createMaterialCard(material, isSameCollection) {
    const card = document.createElement('div');
    card.className = 'material-card';
    if (isSameCollection) {
        card.style.borderLeft = '4px solid #10b981';
    } else {
        card.style.borderLeft = '4px solid #f59e0b';
    }
    
    card.innerHTML = `
        <div class="material-header">
            <div class="material-image">${getSkinEmoji(material)}</div>
            <div class="material-info">
                <div class="material-name">${material.localizedName || material.name}</div>
                <div class="material-quality">
                    ${material.localizedQuality || material.quality} | ${material.collectionName}
                    ${isSameCollection ? ' <span style="color: #10b981;">(同收藏品)</span>' : ' <span style="color: #f59e0b;">(其他收藏品)</span>'}
                </div>
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
// ========== 10合计算器功能 ==========
class TenComboCalculator {
    constructor() {
        this.materialCount = 10; // 默认10合模式
        this.init();
    }
    
    init() {
        this.generateInputs();
        this.setupEventListeners();
        this.addModeSwitch();
        this.addTargetWearInput();
        this.addCalculateLastMaterialButton();
        
        // 立即执行一次计算
        setTimeout(() => {
            this.calculateLastMaterial();
        }, 300);
    }
    
    generateInputs() {
        const container = document.getElementById('tenMaterialInputs');
        container.innerHTML = '';
        
        for (let i = 1; i <= 10; i++) {
            const row = document.createElement('div');
            row.className = 'material-row-ten';
            row.id = `materialRow_${i}`;
            row.innerHTML = `
                <div class="material-input-group">
                    <span class="material-label" data-i18n="material">材料</span>
                    <input type="number" 
                           class="material-input-ten" 
                           id="tenMaterial_${i}" 
                           min="0" max="1" 
                           step="0.0000001" 
                           value="0.0000000">
                </div>
                <div class="range-group">
                    <span class="range-label" data-i18n="min">最小</span>
                    <input type="number" 
                           class="range-input" 
                           id="tenMinWear_${i}" 
                           min="0" max="1" 
                           step="0.0000001" 
                           value="0.0000000">
                </div>
                <div class="range-group">
                    <span class="range-label" data-i18n="max">最大</span>
                    <input type="number" 
                           class="range-input" 
                           id="tenMaxWear_${i}" 
                           min="0" max="1" 
                           step="0.0000001" 
                           value="1.0000000">
                </div>
            `;
            container.appendChild(row);
        }
        
        this.updateMaterialDisplay();
        this.applyLanguage();
    }
    
    setupEventListeners() {
        for (let i = 1; i <= 10; i++) {
            const materialInput = document.getElementById(`tenMaterial_${i}`);
            const minWearInput = document.getElementById(`tenMinWear_${i}`);
            const maxWearInput = document.getElementById(`tenMaxWear_${i}`);
            
            materialInput.addEventListener('change', () => this.validateInput(i));
            minWearInput.addEventListener('change', () => this.validateRange(i));
            maxWearInput.addEventListener('change', () => this.validateRange(i));
        }
    }
    
    addModeSwitch() {
        const productWearControls = document.querySelector('.product-wear-controls');
        
        if (document.getElementById('comboModeSwitch')) {
            return;
        }
        
        const modeSwitchHTML = `
            <div class="product-control-item">
                <label>🎮 合成模式:</label>
                <select id="comboModeSwitch" class="product-short-input" onchange="switchComboMode()">
                    <option value="10">10合模式</option>
                    <option value="5">5合模式</option>
                </select>
            </div>
        `;
        
        const firstControl = productWearControls.querySelector('.product-control-item');
        firstControl.insertAdjacentHTML('beforebegin', modeSwitchHTML);
    }
    
    addTargetWearInput() {
        const productWearControls = document.querySelector('.product-wear-controls');
        
        if (document.getElementById('tenTargetWear')) {
            return;
        }
        
        const targetWearHTML = `
            <div class="product-control-item">
                <label>🎯 目标产物磨损:</label>
                <input type="number" id="tenTargetWear" min="0" max="1" step="0.0000001" value="0.5000000" class="product-short-input">
            </div>
            
            <div class="last-material-calculation" id="lastMaterialCalculation" style="display: none; margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid #444;">
                <h4 style="color: #60a5fa; margin: 0 0 10px 0; font-size: 14px;">🎯 最后一个材料计算</h4>
                <div id="lastMaterialResult" style="color: #90caf9; font-family: monospace; font-size: 13px;"></div>
            </div>
        `;
        
        const calculateButton = productWearControls.querySelector('.btn-calculate-ten');
        calculateButton.insertAdjacentHTML('beforebegin', targetWearHTML);
    }
    
    addCalculateLastMaterialButton() {
        const productWearControls = document.querySelector('.product-wear-controls');
        const calculateButton = productWearControls.querySelector('.btn-calculate-ten');
        
        if (document.getElementById('calculateLastMaterialBtn')) {
            return;
        }
        
        const lastMaterialButtonHTML = `
            <button class="btn-calculate-last" id="calculateLastMaterialBtn" 
                    style="background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: white; 
                           border: none; padding: 15px 25px; border-radius: 8px; cursor: pointer; 
                           font-weight: bold; font-size: 20px; transition: all 0.3s ease; 
                           margin: 10px 0 0 0; width: 100%;"
                    onclick="calculateAndFillLastMaterial()">
                🎯 计算最后一个材料磨损
                           
            </button>
             <div style="color: #ff9800; font-size: 8   px; ">
                💡 提示： 计算最后一个材料磨损请先填写最后一个材料的磨损区间，结果仅供参考，务必点击“计算产物磨损”验算
            </div>
        `;
        
        calculateButton.insertAdjacentHTML('afterend', lastMaterialButtonHTML);
    }
    
    addLastMaterialCalculation() {
        for (let i = 1; i <= 10; i++) {
            const materialInput = document.getElementById(`tenMaterial_${i}`);
            const minWearInput = document.getElementById(`tenMinWear_${i}`);
            const maxWearInput = document.getElementById(`tenMaxWear_${i}`);
            
            if (materialInput) {
                materialInput.addEventListener('input', () => this.calculateLastMaterial());
                materialInput.addEventListener('change', () => this.calculateLastMaterial());
            }
            if (minWearInput) {
                minWearInput.addEventListener('input', () => this.calculateLastMaterial());
            }
            if (maxWearInput) {
                maxWearInput.addEventListener('input', () => this.calculateLastMaterial());
            }
        }
        
        const targetWearInput = document.getElementById('tenTargetWear');
        const productMinWearInput = document.getElementById('tenProductMinWear');
        const productMaxWearInput = document.getElementById('tenProductMaxWear');
        
        if (targetWearInput) {
            targetWearInput.addEventListener('input', () => this.calculateLastMaterial());
        }
        if (productMinWearInput) {
            productMinWearInput.addEventListener('input', () => this.calculateLastMaterial());
        }
        if (productMaxWearInput) {
            productMaxWearInput.addEventListener('input', () => this.calculateLastMaterial());
        }
    }
    
    switchComboMode() {
        const modeSelect = document.getElementById('comboModeSwitch');
        this.materialCount = parseInt(modeSelect.value);
        this.updateMaterialDisplay();
        this.calculateLastMaterial();
        console.log(`切换到 ${this.materialCount} 合模式`);
    }
    
    updateMaterialDisplay() {
        for (let i = 1; i <= 10; i++) {
            const row = document.getElementById(`materialRow_${i}`);
            if (row) {
                if (i <= this.materialCount) {
                    row.style.display = 'flex';
                } else {
                    row.style.display = 'none';
                }
            }
        }
    }
    
    validateInput(index) {
        const materialInput = document.getElementById(`tenMaterial_${index}`);
        const minWearInput = document.getElementById(`tenMinWear_${index}`);
        const maxWearInput = document.getElementById(`tenMaxWear_${index}`);
        
        const value = parseFloat(materialInput.value);
        const minWear = parseFloat(minWearInput.value) || 0;
        const maxWear = parseFloat(maxWearInput.value) || 1;
        
        if (value < minWear || value > maxWear) {
            materialInput.style.borderColor = '#f44336';
            materialInput.title = `磨损值必须在 ${minWear.toFixed(10)} - ${maxWear.toFixed(10)} 范围内`;
        } else {
            materialInput.style.borderColor = '#555';
            materialInput.title = '';
        }
        
        this.calculateLastMaterial();
    }
    
    validateRange(index) {
        const minWearInput = document.getElementById(`tenMinWear_${index}`);
        const maxWearInput = document.getElementById(`tenMaxWear_${index}`);
        
        const minWear = parseFloat(minWearInput.value) || 0;
        const maxWear = parseFloat(maxWearInput.value) || 1;
        
        if (minWear >= maxWear) {
            minWearInput.style.borderColor = '#f44336';
            maxWearInput.style.borderColor = '#f44336';
        } else {
            minWearInput.style.borderColor = '#555';
            maxWearInput.style.borderColor = '#555';
            this.validateInput(index);
        }
        
        this.calculateLastMaterial();
    }
    
    applyLanguage() {
        setTimeout(() => {
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (translations[currentLanguage] && translations[currentLanguage][key]) {
                    element.textContent = translations[currentLanguage][key];
                }
            });
        }, 100);
    }
    
    getAllMaterialValues() {
        const materials = [];
        
        for (let i = 1; i <= this.materialCount; i++) {
            const materialInput = document.getElementById(`tenMaterial_${i}`);
            const minWearInput = document.getElementById(`tenMinWear_${i}`);
            const maxWearInput = document.getElementById(`tenMaxWear_${i}`);
            
            const wearValue = parseFloat(materialInput.value);
            const minWear = parseFloat(minWearInput.value) || 0;
            const maxWear = parseFloat(maxWearInput.value) || 1;
            
            if (!isNaN(wearValue) && wearValue > 0) {
                const range = IEEE754Float32.subtract(maxWear, minWear);
                const numerator = IEEE754Float32.subtract(wearValue, minWear);
                const percentage = range > 0 ? IEEE754Float32.divide(numerator, range) : 0;
                
                materials.push({
                    index: i,
                    wearValue: wearValue,
                    minWear: minWear,
                    maxWear: maxWear,
                    percentage: percentage,
                    range: range
                });
            }
        }
        
        return materials;
    }
    
    calculateLastMaterial() {
        const targetWear = parseFloat(document.getElementById('tenTargetWear').value);
        const productMinWear = parseFloat(document.getElementById('tenProductMinWear').value) || 0;
        const productMaxWear = parseFloat(document.getElementById('tenProductMaxWear').value) || 1;
        
        let lastMaterialSection = document.getElementById('lastMaterialCalculation');
        let lastMaterialResult = document.getElementById('lastMaterialResult');
        
        if (!lastMaterialSection || !lastMaterialResult) {
            this.addTargetWearInput();
            lastMaterialSection = document.getElementById('lastMaterialCalculation');
            lastMaterialResult = document.getElementById('lastMaterialResult');
            if (!lastMaterialSection || !lastMaterialResult) return;
        }
        
        if (isNaN(targetWear) || productMinWear >= productMaxWear) {
            lastMaterialSection.style.display = 'none';
            return;
        }
        
        const validMaterials = [];
        let lastEmptyIndex = -1;
        
        for (let i = 1; i <= this.materialCount; i++) {
            const materialInput = document.getElementById(`tenMaterial_${i}`);
            const minWearInput = document.getElementById(`tenMinWear_${i}`);
            const maxWearInput = document.getElementById(`tenMaxWear_${i}`);
            
            if (!materialInput || !minWearInput || !maxWearInput) continue;
            
            const wearValue = parseFloat(materialInput.value);
            const minWear = parseFloat(minWearInput.value) || 0;
            const maxWear = parseFloat(maxWearInput.value) || 1;
            
            if ((isNaN(wearValue) || wearValue === 0) && lastEmptyIndex === -1) {
                lastEmptyIndex = i;
                continue;
            }
            
            if (!isNaN(wearValue) && wearValue > 0 && wearValue >= minWear && wearValue <= maxWear) {
                const range = IEEE754Float32.subtract(maxWear, minWear);
                const numerator = IEEE754Float32.subtract(wearValue, minWear);
                const percentage = range > 0 ? IEEE754Float32.divide(numerator, range) : 0;
                
                validMaterials.push({
                    index: i,
                    wearValue: wearValue,
                    percentage: percentage,
                    minWear: minWear,
                    maxWear: maxWear
                });
            }
        }
        
        const inputCount = validMaterials.length;
        
        if (inputCount !== this.materialCount - 1 || lastEmptyIndex === -1) {
            lastMaterialSection.style.display = 'none';
            return;
        }
        
        const productRange = IEEE754Float32.subtract(productMaxWear, productMinWear);
        const numerator = IEEE754Float32.subtract(targetWear, productMinWear);
        const requiredTotalPercentage = IEEE754Float32.divide(numerator, productRange);
        
        let currentTotalPercentage = IEEE754Float32.ensureFloat32(0);
        validMaterials.forEach(material => {
            currentTotalPercentage = IEEE754Float32.add(currentTotalPercentage, material.percentage);
        });
        
        const lastMaterialRequiredPercentage = IEEE754Float32.subtract(
            IEEE754Float32.multiply(requiredTotalPercentage, this.materialCount),
            currentTotalPercentage
        );
        
        const lastMinWearInput = document.getElementById(`tenMinWear_${lastEmptyIndex}`);
        const lastMaxWearInput = document.getElementById(`tenMaxWear_${lastEmptyIndex}`);
        const lastMinWear = parseFloat(lastMinWearInput.value) || 0;
        const lastMaxWear = parseFloat(lastMaxWearInput.value) || 1;
        const lastRange = IEEE754Float32.subtract(lastMaxWear, lastMinWear);
        
        const lastMaterialRequiredWear = IEEE754Float32.add(
            IEEE754Float32.multiply(lastMaterialRequiredPercentage, lastRange),
            lastMinWear
        );
        
        if (lastMaterialRequiredPercentage >= 0 && lastMaterialRequiredPercentage <= 1) {
            lastMaterialResult.innerHTML = `
                <div>已输入材料: <strong>${inputCount}</strong> 个</div>
                <div>最后一个材料 (#${lastEmptyIndex}) 需要:</div>
                <div>磨损值: <strong style="color: #4caf50;">${IEEE754Float32.formatPrecise(lastMaterialRequiredWear)}</strong></div>
                <div>百分比: <strong style="color: #ff9800;">${IEEE754Float32.formatPrecise(lastMaterialRequiredPercentage)}</strong></div>
                <div style="font-size: 11px; color: #aaa; margin-top: 5px;">
                    有效范围: ${lastMinWear.toFixed(10)} - ${lastMaxWear.toFixed(10)}
                </div>
                <button onclick="fillLastMaterial(${lastEmptyIndex}, ${lastMaterialRequiredWear})" 
                        style="margin-top: 8px; padding: 6px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    ✅ 填充到材料 #${lastEmptyIndex}
                </button>
            `;
        } else {
            lastMaterialResult.innerHTML = `
                <div style="color: #f44336;">
                    ⚠️ 无法达到目标磨损！
                </div>
                <div style="font-size: 11px; margin-top: 5px;">
                    所需百分比: ${IEEE754Float32.formatPrecise(lastMaterialRequiredPercentage)} (超出0-1范围)
                </div>
            `;
        }
        
        lastMaterialSection.style.display = 'block';
    }
    
    calculateAndFillLastMaterial() {
        const targetWear = parseFloat(document.getElementById('tenTargetWear').value);
        const productMinWear = parseFloat(document.getElementById('tenProductMinWear').value) || 0;
        const productMaxWear = parseFloat(document.getElementById('tenProductMaxWear').value) || 1;
        
        if (isNaN(targetWear) || productMinWear >= productMaxWear) {
            alert('请先设置正确的目标磨损和产物磨损范围！');
            return;
        }
        
        const lastMaterialIndex = this.materialCount;
        
        const lastMinWear = parseFloat(document.getElementById(`tenMinWear_${lastMaterialIndex}`).value) || 0;
        const lastMaxWear = parseFloat(document.getElementById(`tenMaxWear_${lastMaterialIndex}`).value) || 1;
        
        if (lastMinWear >= lastMaxWear) {
            alert(`请先设置材料 ${lastMaterialIndex} 的正确磨损区间！`);
            return;
        }
        
        const validMaterials = [];
        let totalPercentage = IEEE754Float32.ensureFloat32(0);
        let validCount = 0;
        
        for (let i = 1; i < this.materialCount; i++) {
            const materialInput = document.getElementById(`tenMaterial_${i}`);
            const minWearInput = document.getElementById(`tenMinWear_${i}`);
            const maxWearInput = document.getElementById(`tenMaxWear_${i}`);
            
            if (!materialInput || !minWearInput || !maxWearInput) continue;
            
            const wearValue = parseFloat(materialInput.value);
            const minWear = parseFloat(minWearInput.value) || 0;
            const maxWear = parseFloat(maxWearInput.value) || 1;
            
            if (!isNaN(wearValue) && wearValue > 0 && wearValue >= minWear && wearValue <= maxWear) {
                const range = IEEE754Float32.subtract(maxWear, minWear);
                const numerator = IEEE754Float32.subtract(wearValue, minWear);
                const percentage = range > 0 ? IEEE754Float32.divide(numerator, range) : 0;
                
                totalPercentage = IEEE754Float32.add(totalPercentage, percentage);
                validCount++;
                validMaterials.push({
                    index: i,
                    wearValue: wearValue,
                    percentage: percentage
                });
            }
        }
        
        const requiredPreMaterials = this.materialCount - 1;
        if (validCount < requiredPreMaterials) {
            alert(`需要先填写前 ${requiredPreMaterials} 个材料的磨损值！当前已填写 ${validCount} 个。`);
            return;
        }
        
        const productRange = IEEE754Float32.subtract(productMaxWear, productMinWear);
        const numerator = IEEE754Float32.subtract(targetWear, productMinWear);
        const requiredTotalPercentage = IEEE754Float32.divide(numerator, productRange);
        
        const lastMaterialRequiredPercentage = IEEE754Float32.subtract(
            IEEE754Float32.multiply(requiredTotalPercentage, this.materialCount),
            totalPercentage
        );
        
        const lastRange = IEEE754Float32.subtract(lastMaxWear, lastMinWear);
        const lastMaterialRequiredWear = IEEE754Float32.add(
            IEEE754Float32.multiply(lastMaterialRequiredPercentage, lastRange),
            lastMinWear
        );
        
        if (lastMaterialRequiredWear < lastMinWear || lastMaterialRequiredWear > lastMaxWear) {
            alert(`计算结果 ${lastMaterialRequiredWear.toFixed(10)} 超出材料 ${lastMaterialIndex} 的磨损范围 [${lastMinWear.toFixed(10)}, ${lastMaxWear.toFixed(10)}]！`);
            return;
        }
        
        if (lastMaterialRequiredPercentage < 0 || lastMaterialRequiredPercentage > 1) {
            alert(`所需百分比 ${lastMaterialRequiredPercentage.toFixed(6)} 超出有效范围 [0, 1]！`);
            return;
        }
        
        const lastMaterialInput = document.getElementById(`tenMaterial_${lastMaterialIndex}`);
        lastMaterialInput.value = lastMaterialRequiredWear.toFixed(10);
        
        this.showLastMaterialCalculationDetails(
            validMaterials,
            totalPercentage,
            requiredTotalPercentage,
            lastMaterialRequiredPercentage,
            lastMaterialRequiredWear,
            lastMaterialIndex
        );
        
        this.calculateProductWearAndDisplay();
        
        alert(`✅ 已自动填充材料 ${lastMaterialIndex} 的磨损值: ${lastMaterialRequiredWear.toFixed(10)}`);
    }
    
    showLastMaterialCalculationDetails(validMaterials, totalPercentage, requiredTotalPercentage, 
                                     lastMaterialRequiredPercentage, lastMaterialRequiredWear, lastMaterialIndex) {
        let detailsHTML = `
            <h4>📊 最后一个材料计算详情:</h4>
            <div style="font-size: 12px; color: #90caf9; line-height: 1.4;">
                <div>前 ${validMaterials.length} 个材料总百分比: ${IEEE754Float32.formatPrecise(totalPercentage)}</div>
                <div>目标总百分比: ${IEEE754Float32.formatPrecise(requiredTotalPercentage)} × ${this.materialCount} = ${IEEE754Float32.formatPrecise(IEEE754Float32.multiply(requiredTotalPercentage, this.materialCount))}</div>
                <div>材料 ${lastMaterialIndex} 需要百分比: ${IEEE754Float32.formatPrecise(lastMaterialRequiredPercentage)}</div>
                <div>材料 ${lastMaterialIndex} 需要磨损: ${lastMaterialRequiredWear.toFixed(10)}</div>
                <div style="margin-top: 8px; color: #4caf50;">
                    ✅ 计算完成并自动填充！
                </div>
            </div>
        `;
        
        let detailsElement = document.getElementById('lastMaterialDetails');
        if (!detailsElement) {
            detailsElement = document.createElement('div');
            detailsElement.id = 'lastMaterialDetails';
            detailsElement.style.marginTop = '15px';
            detailsElement.style.padding = '15px';
            detailsElement.style.background = 'rgba(255,255,255,0.05)';
            detailsElement.style.borderRadius = '8px';
            detailsElement.style.border = '1px solid #444';
            
            const calculateButton = document.getElementById('calculateLastMaterialBtn');
            calculateButton.parentNode.insertBefore(detailsElement, calculateButton.nextSibling);
        }
        
        detailsElement.innerHTML = detailsHTML;
    }
    
    calculateProductWearAndDisplay() {
        const result = this.calculateProductWear();
        this.displayResults(result);
    }
    
    calculateProductWear() {
        const materials = this.getAllMaterialValues();
        const productMinWear = parseFloat(document.getElementById('tenProductMinWear').value) || 0;
        const productMaxWear = parseFloat(document.getElementById('tenProductMaxWear').value) || 1;
        const targetWear = parseFloat(document.getElementById('tenTargetWear').value);
        
        if (materials.length === 0) {
            return { success: false, error: '请至少输入一个有效的材料磨损值' };
        }
        
        if (productMinWear >= productMaxWear) {
            return { success: false, error: '产物最大磨损必须大于最小磨损' };
        }
        
        let totalPercentage = IEEE754Float32.ensureFloat32(0);
        materials.forEach(material => {
            totalPercentage = IEEE754Float32.add(totalPercentage, material.percentage);
        });
        
        const averagePercentage = IEEE754Float32.divide(totalPercentage, materials.length);
        const productRange = IEEE754Float32.subtract(productMaxWear, productMinWear);
        const productWear = IEEE754Float32.add(
            IEEE754Float32.multiply(averagePercentage, productRange),
            productMinWear
        );
        
        let targetComparison = '';
        if (!isNaN(targetWear)) {
            const difference = Math.abs(IEEE754Float32.subtract(productWear, targetWear));
            targetComparison = ` | 与目标差距: ${difference.toFixed(10)}`;
        }
        
        return {
            success: true,
            productWear: productWear,
            averagePercentage: averagePercentage,
            materialCount: materials.length,
            materials: materials,
            productRange: productRange,
            productMinWear: productMinWear,
            productMaxWear: productMaxWear,
            targetComparison: targetComparison
        };
    }
    
    displayResults(result) {
        const resultSection = document.getElementById('tenResultSection');
        const resultOutput = document.getElementById('tenResultOutput');
        const detailedResults = document.getElementById('tenDetailedResults');
        
        if (!result.success) {
            resultOutput.innerHTML = `<span style="color: #f44336;">❌ ${result.error}</span>`;
            resultSection.style.display = 'block';
            return;
        }
        
        resultOutput.innerHTML = `
            🎯 产物磨损: <span style="color: #4caf50; font-size: 24px;">${IEEE754Float32.formatPrecise(result.productWear)}</span>
            <br>
            <span style="font-size: 14px; color: #90caf9;">
                平均百分比: ${IEEE754Float32.formatPrecise(result.averagePercentage)} | 使用材料: ${result.materialCount}个
                ${result.targetComparison || ''}
            </span>
        `;
        
        let detailedHTML = '<h4>📈 详细计算过程:</h4>';
        
        result.materials.forEach((material, index) => {
            detailedHTML += `
                <div class="detailed-item">
                    <span>材料 ${material.index}: ${material.wearValue.toFixed(10)}</span>
                    <span>百分比: ${IEEE754Float32.formatPrecise(material.percentage)}</span>
                </div>
            `;
        });
        
        detailedHTML += `
            <div class="detailed-item" style="border-top: 2px solid #4caf50; margin-top: 10px;">
                <span><strong>总百分比: ${IEEE754Float32.formatPrecise(result.averagePercentage * result.materialCount)}</strong></span>
                <span><strong>平均: ${IEEE754Float32.formatPrecise(result.averagePercentage)}</strong></span>
            </div>
            <div class="detailed-item">
                <span>产物范围: ${result.productMinWear.toFixed(10)} - ${result.productMaxWear.toFixed(10)}</span>
                <span>范围大小: ${IEEE754Float32.formatPrecise(result.productRange)}</span>
            </div>
            <div class="detailed-item">
                <span>最终计算:</span>
                <span>${IEEE754Float32.formatPrecise(result.averagePercentage)} × ${IEEE754Float32.formatPrecise(result.productRange)} + ${result.productMinWear.toFixed(10)}</span>
            </div>
        `;
        
        detailedResults.innerHTML = detailedHTML;
        resultSection.style.display = 'block';
        
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        this.calculateLastMaterial();
    }
}

let tenComboCalculator;

function initTenComboCalculator() {
    tenComboCalculator = new TenComboCalculator();
}

function calculateTenCombo() {
    if (!tenComboCalculator) {
        initTenComboCalculator();
    }
    
    const result = tenComboCalculator.calculateProductWear();
    tenComboCalculator.displayResults(result);
}

function calculateAndFillLastMaterial() {
    if (tenComboCalculator) {
        tenComboCalculator.calculateAndFillLastMaterial();
    }
}

function switchComboMode() {
    if (tenComboCalculator) {
        tenComboCalculator.switchComboMode();
    }
}

function fillLastMaterial(index, wearValue) {
    const materialInput = document.getElementById(`tenMaterial_${index}`);
    if (materialInput) {
        materialInput.value = wearValue.toFixed(10);
        if (tenComboCalculator) {
            tenComboCalculator.calculateLastMaterial();
        }
    }
}

function bulkFillTenMaterials() {
    if (!tenComboCalculator) {
        initTenComboCalculator();
    }
    
    const bulkInput = document.getElementById('tenBulkFillInput');
    if (!bulkInput.value.trim()) {
        alert('请输入要填充的磨损值！');
        return;
    }

    const values = bulkInput.value
        .match(/\d+\.\d+/g) || []
        .map(val => parseFloat(val.trim()))
        .filter(val => !isNaN(val) && val > 0);

    if (values.length === 0) {
        alert('没有有效的数字！请检查输入格式。');
        return;
    }

    let filledCount = 0;
    
    for (let i = 1; i <= tenComboCalculator.materialCount && filledCount < values.length; i++) {
        const materialInput = document.getElementById(`tenMaterial_${i}`);
        const currentValue = parseFloat(materialInput.value);
        
        if (isNaN(currentValue) || currentValue === 0) {
            materialInput.value = values[filledCount];
            filledCount++;
            
            materialInput.style.transition = 'all 0.3s ease';
            materialInput.style.background = 'rgba(76, 175, 80, 0.2)';
            setTimeout(() => {
                materialInput.style.background = '';
            }, 1000);
        }
    }

    const remainingValues = values.slice(filledCount);
    if (remainingValues.length > 0) {
        bulkInput.value = remainingValues.join(', ');
        alert(`✅ 成功填充 ${filledCount} 个材料！剩余 ${remainingValues.length} 个值。`);
    } else {
        bulkInput.value = '';
        alert(`✅ 成功填充 ${filledCount} 个材料！所有值已使用。`);
    }
    
    tenComboCalculator.calculateLastMaterial();
}

function openTab(tabName) {
    document.querySelectorAll('.tabcontent').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.tab button').forEach(btn => {
        btn.style.backgroundColor = '#374151';
    });
    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.style.backgroundColor = '#2563eb';
    
    if (tabName === 'tenComboDiv' && !tenComboCalculator) {
        setTimeout(initTenComboCalculator, 100);
    }
}
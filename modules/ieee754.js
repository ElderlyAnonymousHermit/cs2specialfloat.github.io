// ========== IEEE754单精度浮点数工具函数 ==========
class IEEE754Float32 {
    static toFloat32(num) {
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setFloat32(0, num, true);
        return view.getFloat32(0, true);
    }
    
    static add(a, b) {
        return this.toFloat32(this.toFloat32(a) + this.toFloat32(b));
    }
    
    static subtract(a, b) {
        return this.toFloat32(this.toFloat32(a) - this.toFloat32(b));
    }
    
    static multiply(a, b) {
        return this.toFloat32(this.toFloat32(a) * this.toFloat32(b));
    }
    
    static divide(a, b) {
        if (b === 0) return 0;
        return this.toFloat32(this.toFloat32(a) / this.toFloat32(b));
    }
    
    static formatPrecise(num) {
        const float32 = this.toFloat32(num);
        return parseFloat(float32.toPrecision(12)).toString();
    }
    
    // 新增：获取符合位数的方法
    static getConformingDigits(num, digits) {
        const float32 = this.toFloat32(num);
        const numStr = this.removeLeadingZeros(float32.toString());
        return numStr.substring(0, digits);
    }
    
    // 符合位数匹配函数
    static isMatchWithConformingDigits(actual, target, digits) {
        const actualFloat = this.toFloat32(actual);
        const targetFloat = this.toFloat32(target);
        
        // 转换为字符串，移除前导零和小数点
        const actualStr = this.removeLeadingZeros(actualFloat.toString());
        const targetStr = this.removeLeadingZeros(targetFloat.toString());
        
        // 比较前N位符合数字
        const actualConforming = actualStr.substring(0, digits);
        const targetConforming = targetStr.substring(0, digits);
        
        return actualConforming === targetConforming;
    }
    
    // 移除前导零和小数点，只保留有效数字
    static removeLeadingZeros(numStr) {
        // 处理科学计数法
        if (numStr.includes('e') || numStr.includes('E')) {
            numStr = parseFloat(numStr).toString();
        }
        
        // 分割整数和小数部分
        let [integerPart, decimalPart = ''] = numStr.split('.');
        
        // 如果整数部分不是0，直接返回整数部分+小数部分
        if (integerPart !== '0') {
            return integerPart + decimalPart;
        }
        
        // 整数部分是0，找到小数部分第一个非零数字的位置
        let firstNonZeroIndex = -1;
        for (let i = 0; i < decimalPart.length; i++) {
            if (decimalPart[i] !== '0') {
                firstNonZeroIndex = i;
                break;
            }
        }
        
        if (firstNonZeroIndex === -1) {
            // 全部是0，返回0
            return '0';
        }
        
        // 返回从第一个非零数字开始的部分
        return decimalPart.substring(firstNonZeroIndex);
    }
    
    // 确保所有数值都是IEEE754单精度
    static ensureFloat32(num) {
        return this.toFloat32(num);
    }
    
    // 批量转换数组为IEEE754
    static ensureArrayFloat32(arr) {
        return arr.map(num => this.toFloat32(num));
    }
    
    // 预计算常量并缓存（性能优化）
    static precomputeConstants(constantsObj) {
        const result = {};
        for (const [key, value] of Object.entries(constantsObj)) {
            result[key] = this.toFloat32(value);
        }
        return result;
    }
    
    // 快速比较函数（优化性能）
    static fastCompare(a, b, precision = 12) {
        const aFloat = this.toFloat32(a);
        const bFloat = this.toFloat32(b);
        
        // 对于高精度比较，使用更高效的方法
        return Math.abs(aFloat - bFloat) < Math.pow(10, -precision);
    }
    
    // 新增：改进的符合位数匹配方法（更可靠）
    static isMatchImproved(actual, target, digits) {
        const actualFloat = this.toFloat32(actual);
        const targetFloat = this.toFloat32(target);
        
        // 转换为固定精度的字符串进行比较
        const actualStr = actualFloat.toFixed(10).replace(/\.?0+$/, '');
        const targetStr = targetFloat.toFixed(10).replace(/\.?0+$/, '');
        
        // 移除小数点
        const actualDigits = actualStr.replace('.', '');
        const targetDigits = targetStr.replace('.', '');
        
        // 比较前N位数字
        return actualDigits.substring(0, digits) === targetDigits.substring(0, digits);
    }
}

// 导出为全局对象
if (typeof window !== 'undefined') { window.IEEE754Float32 = IEEE754Float32;}
   
 function getIEEE754(x) {
  var float = new Float32Array(1);
  float[0] = x;
  return float[0];
}  // ========== IEEE754 转换器功能 ==========

// 扩展IEEE754工具类
IEEE754Float32.getBinaryRepresentation = function(num) {
    const float32 = this.toFloat32(num);
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, float32, true);
    
    const uint32 = view.getUint32(0, true);
    let binary = uint32.toString(2).padStart(32, '0');
    
    // 格式化显示：符号位 | 指数位 | 尾数位
    return `${binary.substring(0, 1)} ${binary.substring(1, 9)} ${binary.substring(9)}`;
};

IEEE754Float32.getHexRepresentation = function(num) {
    const float32 = this.toFloat32(num);
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, float32, true);
    
    const uint32 = view.getUint32(0, true);
    return '0x' + uint32.toString(16).toUpperCase().padStart(8, '0');
};

// 转换函数
function convertIEEE754() {
    const input = document.getElementById('ieee754Input').value.trim();
    const resultsSection = document.getElementById('ieee754Results');
    
    if (!input) {
        resultsSection.style.display = 'none';
        return;
    }
    
    const numberValue = parseFloat(input);
    if (isNaN(numberValue)) {
        alert('请输入有效的数字！');
        return;
    }
    
    // 转换为IEEE754单精度
    const ieee754Value = IEEE754Float32.toFloat32(numberValue);
    
    // 更新显示
    document.getElementById('originalValue').textContent = numberValue.toString();
    document.getElementById('ieee754Value').textContent = IEEE754Float32.formatPrecise(ieee754Value);
    
 
     


    
    resultsSection.style.display = 'block';
}

// 设置示例
function setExample(value) {
    document.getElementById('ieee754Input').value = value;
    convertIEEE754();
}

// 清空转换器
function clearConverter() {
    document.getElementById('ieee754Input').value = '';
    document.getElementById('ieee754Results').style.display = 'none';
}



// 初始化转换器
function initIEEE754Converter() {
    console.log('IEEE754转换器已初始化');
}
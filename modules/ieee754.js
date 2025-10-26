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
}

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.IEEE754Float32 = IEEE754Float32;
}
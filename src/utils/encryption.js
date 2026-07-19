import CryptoJS from 'crypto-js';

// 密钥，生产环境应从环境变量获取
// 注意：必须与后端保持一致
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'habitlearner-secret-key-2024';

/**
 * 加密字符串
 * @param {string} text - 要加密的文本
 * @returns {string} 加密后的文本
 */
export const encrypt = (text) => {
  if (!text) return text;
  try {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
};

/**
 * 解密字符串
 * @param {string} cipherText - 加密后的文本
 * @returns {string} 解密后的文本
 */
export const decrypt = (cipherText) => {
  if (!cipherText) return cipherText;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return cipherText;
  }
};

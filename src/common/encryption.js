import { createHash } from 'crypto';

const encryption = {
  /**
   * md5 函数定义
   * @param str 加密字符串
   * @returns {String} 返回结果
   */
  md5(str, format = 'hex') {
    const md5 = createHash('md5');
    return md5.update(str + '').digest(format);
  },

  sha256(str, key, format = 'base64') {
    const sha256 = createHash('sha256', key);
    return sha256.update(str).digest(format);
  },

  /**
   * 密钥加密解密处理
   * @param {String} str 加密/解密字符串
   * @param {String} operation 加密解密方式 ENCRYPT/DECRYPT
   * @param {String} key 加密解密key，默认不需要传
   * @returns {String} 返回结果
   */
  process(str, operation, key = 'api-scaffold-express-encryption-key') {
    key = this.md5(key);
    const isEncrypt = operation === 'ENCRYPT';
    str = isEncrypt ? str.replace(/###/g, '+') : str;

    const strbuf = isEncrypt
      ? (Buffer.from(str, 'base64'))
      : (Buffer.from(this.md5(str + key).substr(0, 8) + str));

    const box = new Array(256);
    let i;
    for (i = 0; i < 256; i++) {
      box[i] = i;
    }
    const rndkey = [];
    // 产生密匙簿
    for (i = 0; i < 256; i++) {
      rndkey[i] = key.charCodeAt(i % key.length);
    }
    // 用固定的算法，打乱密匙簿，增加随机性，好像很复杂，实际上对并不会增加密文的强度
    let j;
    let tmp;
    for (j = i = 0; i < 256; i++) {
      j = (j + box[i] + rndkey[i]) % 256;
      tmp = box[i];
      box[i] = box[j];
      box[j] = tmp;
    }

    // 核心加解密部分
    let s = '';
    for (let a = j = i = 0; i < strbuf.length; i++) {
      a = (a + 1) % 256;
      j = (j + box[a]) % 256;
      tmp = box[a];
      box[a] = box[j];
      box[j] = tmp;
      // 从密匙簿得出密匙进行异或，再转成字符
      // s += String.fromCharCode(string[i] ^ (box[(box[a] + box[j]) % 256]));
      strbuf[i] = strbuf[i] ^ (box[(box[a] + box[j]) % 256]);
    }

    if (isEncrypt) {
      s = strbuf.toString();
      if (s.substr(0, 8) === this.md5(s.substr(8) + key).substr(0, 8)) {
        s = s.substr(8);
      } else {
        s = '';
      }
    } else {
      s = strbuf.toString('base64');
      const regex = new RegExp('=', 'g');
      s = s.replace(regex, '');
    }

    return s;
  },

  encrypt(str, key) {
    return this.process(str, 'ENCRYPT', key);
  },

  decrypt(str, key) {
    return this.process(str, 'DECRYPT', key);
  }
};

export default encryption;

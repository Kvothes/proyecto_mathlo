const cifrado = {};
const aesjs = require('aes-js');
const key_128 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
//oye alan ahorita crees poder instalar node-rsa??
cifrado.cifrar = (texto) => {
    let texto_bytes = aesjs.utils.utf8.toBytes(texto);
    //El contador es optional, si se omite, comienza desde el 1
    let aesCtr = new aesjs.ModeOfOperation.ctr(key_128, new aesjs.Counter(5));
    let encryptedBytes = aesCtr.encrypt(texto_bytes);
    let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedHex;
}

cifrado.desencriptar = (encryptedHex) => {
    
    let encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    //El contador es optional, si se omite, comienza desde el 1
    let aesCtr = new aesjs.ModeOfOperation.ctr(key_128, new aesjs.Counter(5));
    let decryptedBytes = aesCtr.decrypt(encryptedBytes);
    let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    
    return decryptedText;
}

module.exports = cifrado;
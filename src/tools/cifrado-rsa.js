
const cifradoRSA = {};
const NodeRSA = require('node-rsa');
const key = new NodeRSA({b: 512});
cifradoRSA.cifrarRSA=(texto)=>{
    const encrypted = key.encrypt(texto, 'hex');
    console.log('encrypted: ', encrypted);
    return encrypted;
    ///ay alguno oto formato que no ocupe el /////????????????????
}
cifradoRSA.decifrarRSA=(encrypted)=>{
    const decrypted = key.decrypt(encrypted, 'utf8');
    console.log('decrypted: ', decrypted);
    return decrypted;
}

module.exports = cifradoRSA;


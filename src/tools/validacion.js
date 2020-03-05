
const validacion = {};

const validator = require('validator');
const cifrado = require('./cifrado');

validacion.registro = (nom, appat, apmat, cor, sex, usnam, pas, conf, tip, radio) => {
    let msg = {
        "estado": true,
        "nombre": false,
        "appat": false,
        "apmat": false,
        "cor": false,
        "sex": false,
        "usnam": false,
        "pas": false,
        "tip": false,
        "radio": false
    }
    if (radio != "si") {
        msg.estado = false;
        msg.radio = true;
    }
    if (!validaCorreo(cor)) {
        mensaje = "El correo electronico es inválido";
        msg.estado = false;
        msg.cor = true;
    } else if (!validaNombre(nom)) {
        mensaje = "El nombre es inválido";
        msg.estado = false;
        msg.nombre = true;
    } else if (!validaNombre(appat)) {
        mensaje = "El apellido paterno es inválido";
        msg.estado = false;
        msg.appat = true;
    } else if (!validaNombre(apmat)) {
        mensaje = "El apellido materno es inválido";
        msg.estado = false;
        msg.apmat = true;
    } else if (!validaSexo(sex)) {
        mensaje = "El sexo es inválido";
        msg.estado = false;
        msg.sex = true;
    } else if (!validaUsnam(usnam)) {
        mensaje = "El nombre de usuario es inválido";
        msg.estado = false;
        msg.usnam = true;
    } else if (!validaTipo(tip)) {
        mensaje = "El tipo de usuario es inválido";
        msg.estado = false;
        msg.tip = true;
    } else if (!validaPassword(pas, conf)) {
        mensaje = "La contraseña es inválida";
        msg.estado = false;
        msg.pas = true;
    }
    return msg;
}


//Funciones para validar datos de registro
function validaCorreo(cor) {
    let valido = true;
    if (!validator.isEmail(cor)) {
        valido = false;
    }
    if (validator.isEmpty(cor)) {
        valido = false;
    }
    return valido;
}

function validaPassword(pas, conf) {
    let valido = true;
    if (pas != conf) {
        valido = false;
    }
    if (pas.length >= 50) {
        valido = false;
    }
    return valido;
}

function validaTipo(tipo) {
    let valido = true;
    if (tipo != 1 && tipo != 2) {
        valido = false;
    }
    return valido;
}

function validaUsnam(usnam) {
    let valido = true;
    if (!validator.isAlphanumeric(usnam)) {
        valido = false;
    }
    if (validator.isEmpty(usnam)) {
        valido = false;
    }
    if (usnam.length >= 50) {
        valido = false;
    }
    return valido;
}

function validaSexo(sex) {
    let valido = true;
    if (sex != 1 && sex != 2 && sex != 3) {
        valido = false;
    }
    return valido;
}

function validaNombre(nom) {
    let valido = true;
    if (validator.isEmpty(nom)) {
        valido = false;
    }
    if (nom.length >= 50) {
        valido = false;
    }
    return valido;
}

function ValidarAviso(aviso) {

}

//Funciones de las practicas
validacion.Practicas = (archivo, descripcion) => {
    let mensaje;
    let msg = {
        "estado": true,
        "archivo": false,
        "descriptcion": false
    }
    if (!validarArchivo(archivo)) {
        mensaje = "Debe seleccionar un archivo";
        msg.estado = false;
        msg.archivo = true;
    }
    if (!validarDescripcion(descripcion)) {
        mensaje = "Debe poner una descripción";
        msg.estado = false;
        msg.archivo = true;
    }
    return msg;
}

function validarArchivo(archivo) {
    let valido = true;
    if (archivo == undefined || archivo == null) {
        valido = false;
    }
    return valido;
}
function validarDescripcion(descripcion) {
    let valido = true;
    if (descripcion.length < 1) {
        valido = false;
    }
    return valido;
}

function validarIdSemestre(sem) {

}


module.exports = validacion;
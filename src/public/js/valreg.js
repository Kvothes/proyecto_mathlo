
let enviar=document.getElementById('send'); 
 
function retrono(){
    let nombre=document.getElementById('nom').value; 
    let paterno=document.getElementById('appat').value;
    let materno=document.getElementById('apmat').value; 
    let sexo=document.getElementById('sex').value; 
    let tusuario=document.getElementById('tipo').value; 
    let usuario=document.getElementById('username').value; 
    let correo=document.getElementById('email').value; 
    let contraseña=document.getElementById('pas').value; 
    let confirmacontraseña=document.getElementById('conf').value; 
    /*-----------------------------*/
    let vnombre=validarnombreapellido(nombre,"nombre"); 
    if(vnombre==true){
        document.getElementById('anombre').innerHTML=""; 
        let vpaterno=validarnombreapellido(paterno, "apellido paterno");
        if(vpaterno==true){
            document.getElementById('aappat').innerHTML=""; 
            let vmaterno=validarnombreapellido(materno, "apellido materno");
            if(vmaterno==true){ 
                document.getElementById('aapmat').innerHTML=""; 
                if(sexo!="1" && sexo!="2" && sexo!="3"){ 
                    document.getElementById('asex').innerHTML="Sexo es inválido";
                    return false
                }else{
                    document.getElementById('asex').innerHTML="";
                    if(tusuario!="1" && tusuario!="2"){
                        document.getElementById('atipo').innerHTML="Tipo de usuario inválido";
                        return false
                    }else{
                        document.getElementById('atipo').innerHTML="";
                        let vusuario=validarnombreusuario(usuario); 
                        if (vusuario==true){
                            document.getElementById('ausername').innerHTML="";
                            let vemail=validarEmail(correo);
                            if(vemail==true){
                                document.getElementById('aemail').innerHTML="";
                                let vcontraseña=ValidarContraseña(contraseña);
                                if(vcontraseña){
                                    document.getElementById('apas').innerHTML=""; 
                                    if(confirmacontraseña==contraseña){
                                        return true;
                                    }else{
                                        document.getElementById('aconf').innerHTML="Las contraseñas no coinciden";
                                        return false;
                                    }
                                }else{
                                    document.getElementById('apas').innerHTML="Contraseña inválida, debe tener al menos 8  y menos de 50 caracteres, un número y una mayúscula";
                                    return false; 
                                }
                            }else{
                                document.getElementById('aemail').innerHTML=vemail;
                                return false; 
                            }
                        }else{
                            document.getElementById('ausername').innerHTML=vusuario;
                            return false;
                        }
                    }
                }
            }else{
                document.getElementById('aapmat').innerHTML=vmaterno; 
                return false;
            }
        }else{
            document.getElementById('aappat').innerHTML=vpaterno;
            return false; 
        }
    }else{
        document.getElementById('anombre').innerHTML=vnombre; 
        return false; 
    }
    
}



function validarnombreapellido(nombre, tipo){
    if (nombre.length<3 || nombre.length>50){
        if(tipo=="apellido materno" || tipo=="apellido paterno"){
            return "El "+tipo+" debe estar entre 3 y 50 caracteres"
        }else{
            return "El nombre debe estar entre 3 y 50 caracteres"
        }
    }else{
        if(!validacaracteres("qwertyuiopasdfghjklñzxcvbnmQWERTYUIOPASDFGHJKLÑZXCVBNMáéíóúÄÁÉÏíÓúÖÜý", nombre)){
            if(tipo=="apellido materno" || tipo=="apellido paterno"){
                return "El "+tipo+" sólo debe contener letras"
            }else{
                return "El nombre sólo debe contener letras"
            }
        }else{
            return true; 
        }
    } 
}
function validarnombreusuario(username){
    if (username.length<3 || username.length>50){
        return "El usuario debe estar entre 3 y 30 caracteres"
    }else{
        if(!validacaracteres("qwertyuiopasdfghjklñzxcvbnmQWERTYUIOPASDFGHJKLÑZXCVBNMáéíóúÄÁÉÏíÓúÖÜý1234567890", username)){
            return "El nombre de usuario sólo acepta números y letras"
        }else{
            return true; 
        }
    } 
}

function validarEmail(email) { 
    if(email.length<1){
        return "El correo no puede estar vacío"; 
    }else{
        let ban=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(email);
        if(ban){
            return true; 
        }else{
            return "El correo Es inválido"
        }
    } 
}

function validacaracteres(carac, val){
    let arreglo = [];
    a = true;
    for (let i = 0; i < val.length; i++) {
        arreglo[i] = false;
    }
    for (let i = 0; i < val.length; i++) {
        for (let j = 0; j < carac.length; j++) {
            if (val.charAt(i) == carac.charAt(j)) {
                arreglo[i] = true;
                break;
            }
        }
        if (arreglo[i] == false) {
            a = false;
            break; 
        }
    }
    return a;
}
//Contraseña inválida, debe tener al menos 8  y menos de 50 caracteres y un número
function ValidarContraseña(contraseña){
    if(contraseña.length<8){
        return false;
    }else{
        const numeros="1234567890";
        const mayusculas="QWERTYUIOPASDFGHJKLÑZXCVBNMÓÉÍÚÁÚÜÄËÖÏ"; 
        let contn=0,contm=0; 
        for(let i=0;i<contraseña.length; i++){
            for(let j=0; j<numeros.length; j++){
                if(contraseña.charAt(i)==numeros.charAt(j)){
                    contn++; 
                    if(contm>0) break;   
                }
            }
            for(let k=0; k<mayusculas.length; k++){
                if(contraseña.charAt(i)==mayusculas.charAt(k)){
                    contm++;
                    if(contm>0) break;  
                }
            }
            if(contn>0 && contm>0) break; 
        }
        if(contn>0 && contm>0){
            return true;
        }else{
            return false; 
        }
    }
}

enviar.addEventListener('click', (e)=>{
    if(!retrono()){
        e.preventDefault(); 
    }
}, false); 



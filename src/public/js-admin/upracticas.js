


function extensionn(file, doc, doc2){
    if(doc.length==0){
        document.getElementById('avisos').innerText="Debe de subir un archivo";
        return false; 
    }else{
        if(file==null){
            document.getElementById('avisos').innerText="EL archivo subido es inválido, intente con un pdf"; 
            return false;
        }else{
            if(doc2.size>500000){
                document.getElementById('avisos').innerText="El archivo debe de tener menos de 5 megas"; 
                return false; 
            }else{
                return true; 
            }

        }
    }
    
    
}

function validarsem(sem){
    if(sem!="1" && sem!="2" && sem!="3" && sem!="4" && sem!="5" && sem!="6"){
        return false; 
    }else{
        return true; 
    }
}

document.getElementById('send').addEventListener('click', (e)=>{
    let doc= document.getElementById('pdf').value;
    let doc2= document.getElementById('pdf').files[0];
    let extension= /pdf/; 
    let file = extension.exec(doc); 
    
    if(extensionn(file,doc, doc2)==true){
        
        return true;      
    }else{
        e.preventDefault(); 
    }
}); 


function correct(){
    let nombre=document.getElementById('username').value; 
    let password=document.getElementById('password').value; 
    if(nombre=="" || password==""){
        document.getElementById('avisos').innerText="Todos los campos tienen que estar llenos"
        return false}else{return true}
}

document.getElementById('send').addEventListener('click', (e)=>{
    if(!correct()) e.preventDefault();
}); 
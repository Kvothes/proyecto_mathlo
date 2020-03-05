const socket = io();
let message = document.getElementById('message');
let username = document.getElementById('username');
let btn = document.getElementById('send');
let output = document.getElementById('output');
let actions = document.getElementById('actions');
message.addEventListener('keypress',()=>{
    socket.emit('chat:typing',username.value);
});
message.addEventListener('keypress', (e) => {
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == 13) {
        btn.click(); 
    } 
    
});

btn.addEventListener('click', () => { 
    if (message.value.length>0){
        socket.emit('chat:message', {
            username: username.value,
            message: message.value
        });
    }
    message.value="";  
    if (username.value.length>0){
        username.disabled=true; 
    }
    
});

socket.on('chat:message', (data) => {
    actions.innerHTML='';
    output.innerHTML += `
                <p>
                    <strong>
                        ${data.username}
                    </strong>:${data.message}
                </p>`;
});
socket.on('chat:typing',(data)=>{
   
    actions.innerHTML=`<p><em>${data}</em> esta escribiendo...</p>`;
});

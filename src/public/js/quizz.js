let numero_preguntas=0; 
        let json={}
        function addQuestion(){
            document.getElementById('btnadd').innerHTML="";
            numero_preguntas+=1; 
           
            let a = "Ingresa la pregunta: <input type='text' id='pregunta"+numero_preguntas+"'> "+
            "iniciso a: <input type='text' id='ia"+numero_preguntas+"'>"+
            "inciso b: <input type='text' id='ib"+numero_preguntas+"'> "+
            "inciso c: <input type='text' id='ic"+numero_preguntas+"'>"+ 
            "inciso d: <input type='text' id='id"+numero_preguntas+"'>"+
            "<button id='ok' class='btn waves-effect waves-light' onclick='seguir()'>Aceptar</button>"+
            "<button id='addok' class='btn waves-effect waves-light' onclick='add()'>Añadir</button>"; 
            document.getElementById('preguntas').innerHTML=a; 
        }
        function seguir(){
            let a,b,c,d,p;
            p=document.getElementById('pregunta'+numero_preguntas+'').vaule; 
            a=document.getElementById('ia'+numero_preguntas+'').vaul; 
            b=document.getElementById('ib'+numero_preguntas+'').vaule;
            c=document.getElementById('ic'+numero_preguntas+'').vaule;
            d=document.getElementById('id'+numero_preguntas+'').vaule;
            alert(p)
            const btn="<button id='add' class='btn waves-effect waves-light' onclick='addQuestion()'>Añadir pregunta</button>";
            let content="<p id='cp'></p>"+
            "<p id='ca'></p>"+
            "<p id='cb'></p>"+
            "<p id='cc'></p>"+
            "<p id='cd'></p>"; 
            document.getElementById('preguntas').innerHTML=""; 
            document.getElementById('btnadd').innerHTML=btn;
            
        }
        function add(){
            let a="pregunta"+numero_preguntas;
           let p=document.getElementById(a).vaule;
           alert(p)
        }
      
        function validarcampos(){

        }
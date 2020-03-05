let vi = document.getElementById('VI');
let uvi = document.getElementById("UVI").value;
let ti = document.getElementById('TI');
let uti = document.getElementById('UTI').value;
let pi = document.getElementById('PI');
let upi = document.getElementById('UPI').value;
let vf = document.getElementById('VF');
let uvf = document.getElementById('UVF').value;
let tf = document.getElementById('TF');
let utf = document.getElementById('UTF').value;
let pf = document.getElementById('PF');
let upf = document.getElementById('UPF').value;
let resolver = document.getElementById('Resolver');
let datos;

resolver.addEventListener('click', function () {
    uvi = document.getElementById("UVI").value;
    uti = document.getElementById('UTI').value;
    upi = document.getElementById('UPI').value;
    uvf = document.getElementById('UVF').value;
    utf = document.getElementById('UTF').value;
    upf = document.getElementById('UPF').value;
    vi = document.getElementById('VI');
    ti = document.getElementById('TI');
    pi = document.getElementById('PI');
    vf = document.getElementById('VF');
    tf = document.getElementById('TF');
    pf = document.getElementById('PF');
    datos = [ vi, uvi, ti, uti, pi, upi, vf, uvf, tf, utf, pf, pf];
    console.log(datos);
    let fun = indicador(datos); 
});

function indicador(data) {
    let auxi = data;
    console.log(auxi);
}

function name(params) {
    
}

function name(params) {
    
}

function name(params) {
    
}
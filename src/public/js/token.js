//generador de clave
function clave() {
    let abc = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    let l1 = abc[Math.floor(Math.random() * (50))];
    let l2 = abc[Math.floor(Math.random() * (50))];
    let l3 = abc[Math.floor(Math.random() * (50))];
    console.log('letra 1: '+l1+' letra 2: '+l2+' letra 3: '+l3);
    let prim = calcular_primo(Math.floor(Math.random() * (10000-1000)+1000));
    console.log('El primo es: '+prim);
    let hexaprim = prim.toString(16); 
    console.log("El número decimal %s en hexadecimal es %s", prim, hexaprim);
    let t = [l1, l2, l3];
    hexaprim.split('').forEach(hexaprim => 
        t.push(hexaprim)
    );
    console.log(t);
    for (var i = t.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = t[i];
      t[i] = t[j];
      t[j] = temp;
    } 
    console.log(t);
    let st = t.toString();
    console.log(st);
    st = st.replace(/,/g, "");
    console.log(st);
    document.getElementById('token').value = st;
}
//primo
  function calcular_primo(num) {
    let p = true;
    for (let i = 2; i < num; i++) {
      if (num % i == 0) {
        p = false;
      }
    }
    if (num == 2) {
      p = true;
    } else if (num == 1) {
      p = false;
    }
    if(p == true){
        return num;
    }else {
      return calcular_primo(Math.floor(Math.random() * (10000-1000)+1000));
    }
  }
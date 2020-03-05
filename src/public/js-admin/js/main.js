const btnSwitch= document.querySelector('#switch');
const btnPrueb= document.querySelectorAll('#nani');

btnSwitch.addEventListener('click',()=>{
    document.body.classList.toggle('dark');
    btnSwitch.classList.toggle('active');
});

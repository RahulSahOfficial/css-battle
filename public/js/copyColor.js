const colorsEl=document.getElementsByClassName("each-color");
for(let i=0;i<colorsEl.length;i++){
    colorsEl[i].addEventListener("click",function(){
        const color=this.getElementsByClassName("text")[0].innerText;
        navigator.clipboard.writeText(color);

        this.classList.add('copied');
        setTimeout(() => {
            this.classList.remove('copied');
        }, 1000);
    });
}
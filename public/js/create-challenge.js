const problemSelect=document.querySelector("#problem");
const imagePlaceHolder=document.querySelector("#question-image");
problemSelect.addEventListener("input",renderProblemImage);

function renderProblemImage(){
    imagePlaceHolder.src=`../asset/problems/${problemSelect.value}.png`
}
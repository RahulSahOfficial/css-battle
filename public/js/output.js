const compareBtm=document.getElementById("compare");
const outputImageTarget=document.getElementById("output-target");
const frameOutput=document.getElementsByClassName("frame-output-combo")[0];
const slider=document.getElementById("slider");
const sliderSpan=document.getElementById("slider-span");

compareBtm.addEventListener("input",()=>{
    if(compareBtm.checked)
        outputImageTarget.style.opacity=0.5;
    else
        outputImageTarget.style.opacity=0;
})
frameOutput.addEventListener("mousemove",(event)=>{
    if(event.layerX>=0 && event.layerX<400){
        slider.style.left=event.layerX+'px';
        sliderSpan.innerText=event.layerX;
    }
})
frameOutput.addEventListener("mouseenter",()=>{
    slider.style.opacity=1;
})
frameOutput.addEventListener("mouseleave",()=>{
    slider.style.opacity=0;
})
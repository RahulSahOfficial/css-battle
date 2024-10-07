const outputCanvas=document.getElementById("outputCanvas");
const targetCanvas=document.getElementById("targetCanvas");
const submitBtn=document.getElementById("submit-btn");
const targetCtx = targetCanvas.getContext("2d");


submitBtn.addEventListener("click",compareTargetOutput);

function compareTargetOutput () {
    let targetData=targetCtx.getImageData(0,0,400,300);
    targetData=targetData.data;

    html2canvas(outputFrame.contentDocument.body,{
        scale:1
    }).then((canvas) => {
        const outputCtx=canvas.getContext("2d");
        let outputData=outputCtx.getImageData(0,0,400,300);
        outputData=outputData.data;
        let matchCnt=0,matchPercent=0;
        for(let i=0;i<300*400*4;i+=4){
            if(outputData[i]==targetData[i] && outputData[i+1]==targetData[i+1] && outputData[i+2]==targetData[i+2] && outputData[i+3]==targetData[i+3])
                matchCnt++;
        }
        matchPercent=parseFloat((matchCnt*100/(400*300)).toFixed(2));
        alert(matchPercent+'%');
    })
}
const outputCanvas=document.getElementById("outputCanvas");
const targetCanvas=document.getElementById("targetCanvas");
const submitBtn=document.getElementById("submit-btn");
const msgBox=document.getElementById("msg-box");
const targetCtx = targetCanvas.getContext("2d");

submitBtn.addEventListener("click",compareTargetOutput);

function compareTargetOutput () {
    submitBtn.disabled=true;
    submitBtn.querySelector("span").innerText='Running';
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
        const code=JSON.stringify({
          html:htmlEditor.getValue(),
          css:cssEditor.getValue()
        })
        fetch(window.location.href, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: code,
              match: matchPercent,
            }),
          })
            .then(response => {
              if (response.ok) {
                msgBox.classList.add('success');
                msgBox.innerText=`Submitted ${matchPercent}% match`;
                setTimeout(()=>{
                  msgBox.classList.remove('success');
                },1500)
                submitBtn.disabled=false;
                submitBtn.querySelector("span").innerText='Submit';
                
                const currTime=new Date();
                const totalSec=endTime-currTime;
                if(totalSec<=0)
                    location.reload();
              } else {
                msgBox.classList.add('danger');
                msgBox.innerText=`Somethin went wrong! Try Again`;
                setTimeout(()=>{
                  msgBox.classList.remove('danger');
                },1500)
                submitBtn.disabled=false;
                submitBtn.querySelector("span").innerText='Submit';

                const currTime=new Date();
                const totalSec=endTime-currTime;
                if(totalSec<=0)
                    location.reload();
              }
            })
            .catch(error => {
              msgBox.classList.add('danger');
                msgBox.innerText=`Somethin went wrong! Try Again`;
                setTimeout(()=>{
                  msgBox.classList.remove('danger');
                },1500)
              submitBtn.disabled=false;
              submitBtn.querySelector("span").innerText='Submit';

              const currTime=new Date();
              const totalSec=endTime-currTime;
              if(totalSec<=0)
                    location.reload();
            });
    })
}
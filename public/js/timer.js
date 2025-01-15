const timerSpan=document.querySelector("#timer-box");
function updateTime(){
    const currTime=new Date();
    const totalSec=Math.max(parseInt((endTime-currTime)/1000),0);
    const min=parseInt(totalSec/60);
    const sec=totalSec%60;

    timerSpan.innerHTML=`${String(min).length==1?'0'+min:min} min : ${String(sec).length==1?"0"+sec:sec} sec`;
    if(totalSec<=0)
        compareTargetOutput();
}
updateTime();
setInterval(updateTime,1000);
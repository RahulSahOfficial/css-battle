const targetCanvas=document.getElementById("targetCanvas");
const targetCtx = targetCanvas.getContext("2d");
targetCanvas.height=300;
targetCanvas.width=400;
const targetImg = new Image();
targetImg.src=`/asset/problems/${problemImage}`;

targetImg.addEventListener("load", () => {
    targetCtx.drawImage(targetImg, 0, 0);
});
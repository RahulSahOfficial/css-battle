const outputFrame=document.getElementById("output-frame");
const defaultCss=`body{
    margin: 0px;
    overflow: hidden;
    height:300px;
    width:400px;
}`;
const render = () =>{
    const htmlCode=htmlEditor.getValue();
    const cssCode=cssEditor.getValue();
    const challengeCodes={
        html:htmlCode,
        css:cssCode
    };
    let localCodes=JSON.parse(localStorage.getItem("localCodes"));
    localCodes[challengeId]=challengeCodes;
    localStorage.setItem("localCodes",JSON.stringify(localCodes));
    outputFrame.contentDocument.body.innerHTML=htmlCode+"<style>"+defaultCss+cssCode+"</style>";
}

htmlEditor.session.on("change", render);
cssEditor.session.on("change", render);
render();
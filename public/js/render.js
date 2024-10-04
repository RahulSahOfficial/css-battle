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
    outputFrame.contentDocument.body.innerHTML=htmlCode+"<style>"+defaultCss+cssCode+"</style>";
}

htmlEditor.session.on("change", render);
cssEditor.session.on("change", render);
render();
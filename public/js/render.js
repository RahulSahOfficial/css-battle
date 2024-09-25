const outputFrame=document.getElementById("output-frame");

const render = () =>{
    const htmlCode=htmlEditor.getValue();
    const cssCode=cssEditor.getValue();
    outputFrame.contentDocument.body.innerHTML=htmlCode+"<style>"+cssCode+"<style>";
}

htmlEditor.session.on("change", render);
cssEditor.session.on("change", render);
render();
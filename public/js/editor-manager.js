ace.require("ace/ext/language_tools");
var htmlEditor = ace.edit("html-editor");
htmlEditor.session.setMode("ace/mode/html");
htmlEditor.setTheme("ace/theme/monokai");
htmlEditor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    fontSize: "14pt",
    showPrintMargin:false, 
    fontFamily: 'monospace',
});
htmlEditor.setValue("<div></div>");
htmlEditor.clearSelection(); 

var cssEditor = ace.edit("css-editor");
cssEditor.session.setMode("ace/mode/css");
cssEditor.setTheme("ace/theme/monokai");
cssEditor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    fontSize: "14pt",
    showPrintMargin:false, 
    fontFamily: 'monospace',
});
cssEditor.setValue(`body{
    background: red;
    display: flex;
    align-items: center;
    justify-content: center;
}
div{
    width: 200px;
    height: 40px;
    background: #B5E0BA;
}`);
cssEditor.clearSelection();
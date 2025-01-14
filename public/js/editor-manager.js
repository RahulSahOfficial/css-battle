ace.require("ace/ext/language_tools");
const htmlBoilerplateCode="<div></div>";
const cssBoilerplateCode=`div{
    width: 100px;
    height: 100px;
    background: blue;
}`;

let localCodes=JSON.parse(localStorage.getItem("localCodes"))||{};
let challengeCodes=localCodes.hasOwnProperty(challengeId) ? localCodes[challengeId] : {
    html:htmlBoilerplateCode,
    css:cssBoilerplateCode
};
localCodes[challengeId]=challengeCodes;
localStorage.setItem("localCodes",JSON.stringify(localCodes));

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
htmlEditor.setValue(challengeCodes.html);
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
cssEditor.setValue(challengeCodes.css);
cssEditor.clearSelection();

document.addEventListener("keydown", function(e) {
    if (e.key === 's' && (navigator.userAgent.includes('Mac') ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
    }
}, false);
console.log('js is working');

marked.setOptions({
    highlight: function(code, lang) {
        return hljs.highlight(code, {language:lang}).value;
      }
  });

renderLatex = function(){
  renderMathInElement(document.body, {
    // customised options for latex autorender
    // auto-render specific keys, e.g.:
    delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
    ],
    // rendering keys, e.g.:
    throwOnError : false
    });
}

updateHref = function(newHref){
    window.history.pushState({}, '', newHref)
    window.dispatchEvent(new Event('popstate'));
};

load_markdown = async function(file, options){
    return fetch(file)
            .then(response => response.text())
            .then(text => document.querySelector("section.content").innerHTML = marked.parse(text, options))
            .then(()=>renderLatex())
}

window.onload = function(){
    if (window.location.pathname === "/index.html"){
        pageParam = new URL(location.href).searchParams.get("page")
        if (pageParam == null){
            updateHref(window.location.origin)
        }else{
            updateHref(pageParam)
        }
    }
    load_content()
}

load_content = function(){
    pathName = window.location.pathname.split('/')

    if (pathName.length <= 2){
        // main menus
        menuName = pathName.at(-1)
        if (menuName !== ""){
            data = "content/" + menuName + ".md"
            load_markdown(data)
                .then(() => (menuName === "notes") ? loadNotes(): null)
        }
    }else{
        // probably is on notes submenus
        if (pathName.at(1) === "notes"){
            load_markdown("../content/notes/" + pathName.at(2) + ".md", options={baseUrl:"../content/notes/"})
        }else{
            // invalid path
            updateHref("/")
        }
    }
}

// add click event to menu items
document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", ()=>{
        updateHref("/" + item.getAttribute("data-file").split(".")[0])
    })
});

// handle the notes section
loadNotes = function(){
    document.querySelectorAll(".notes-item").forEach(item => {
        item.addEventListener("click", ()=>{
            data = item.getAttribute("data-file")
            updateHref("/notes/" + data.split("/").at(-1).split(".")[0])
        })
    })
};

window.addEventListener('popstate', load_content);

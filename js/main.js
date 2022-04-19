console.log('js is working');

window.onload = function(){
    if (window.location.pathname === "/index.html"){
        pageParam = new URL(location.href).searchParams.get("page")
        if (pageParam == null){
            window.history.pushState({}, '', window.location.origin)
        }else{
            window.history.pushState({}, '', pageParam)
        }
    }
    load_content()
}

load_content = function(){
    dataFileName = window.location.href.split("/").at(-1)

    if (dataFileName !== ""){
        data = "content/" + window.location.href.split("/").at(-1) + ".md"
        fetch(data)
            .then(response => response.text())
            .then(text => document.querySelector("section.content").innerHTML = marked.parse(text))
    }
}

// add click event to menu items
document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", ()=>{
        window.history.pushState({}, '', item.getAttribute("data-file").split(".")[0])
        window.dispatchEvent(new Event('popstate'));
    })
});

window.addEventListener('popstate', load_content);

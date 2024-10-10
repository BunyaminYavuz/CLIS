const getIndexPage = (req, res) =>{
    res.render("index",{
        link:'index'
    });
}

const getAboutPage = (req, res) =>{
    res.render("about",{
        link:'about'
    });
}

const getContactPage = (req, res) =>{
    res.render("contact",{
        link:'contact'
    });
}



export { getIndexPage, getAboutPage, getContactPage };
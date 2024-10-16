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

const getRegisterPage = (req, res) =>{
    res.render("register",{
        link:'register'
    });
}



export { getIndexPage, getAboutPage, getContactPage, getRegisterPage };
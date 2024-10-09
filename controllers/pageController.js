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

const getLaptopPage = (req, res) =>{
    res.render("laptop",{
        link:'laptop'
    });
}

export { getIndexPage, getAboutPage, getContactPage, getLaptopPage };
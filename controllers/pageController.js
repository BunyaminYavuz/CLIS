import Announcement from "../models/announcementModel.js";
import Lab from "../models/labModel.js";

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

const getLoginPage = (req, res) =>{
    res.render("login",{
        link:'login'
    });
}

const logout = (req, res) =>{
    res.cookie('jwt','',{
        maxAge:1
    })
    res.redirect('/')
}

// Get the main page
const getMainPage = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.render('index', { announcements, link: 'index' });
  } catch (error) {
    console.error("Error loading main page:", error);
    res.status(500).json({
      succeeded: false,
      error: "An error occurred while loading the main page"
    });
  }
};

const getLabs = async (req, res) => {
  try {
    const labs = await Lab.find();
    res.status(200).json({
      succeeded: true,
      labs
    });
  } catch (error) {
    console.error("Error fetching labs:", error);
    res.status(500).json({
      succeeded: false,
      error: "An error occurred while fetching labs"
    });
  }
};

export { getIndexPage, getAboutPage, getContactPage, getRegisterPage, getLoginPage, logout, getMainPage, getLabs };
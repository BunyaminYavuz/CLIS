import User from "../models/userModel.js";
import Computer from "../models/computerModel.js"
import ScannedStudent from "../models/scannedStudent.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import Lab from "../models/labModel.js";

const createUser = async (req, res) => {
  try {
    const userData = {
      ...req.body,
      role: req.body.role || 'student'
    };

    const user = await User.create(userData);
    res.status(201).json({
      succeeded: true,
      user: user._id,
    });
  } catch (error) {
    let errors2 = {};

    if (error.code === 11000) {
      if (error.keyPattern.email) {
        errors2.email = "Bu email adresi zaten kayıtlı!";
      }
      if (error.keyPattern.studentNumber) {
        errors2.studentNumber = "Bu öğrenci numarası zaten kayıtlı!";
      }
    }

    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((key) => {
        errors2[key] = error.errors[key].message;
      });
    }

    console.log("Validation Errors:", errors2);
    res.status(400).json(errors2);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email);

    if (!email || !password) {
      return res.status(400).json({
        succeeded: false,
        error: "Email ve şifre gereklidir"
      });
    }

    const user = await User.findOne({ email }).select('+password');
    console.log("Fetched user:", user);
    
    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        succeeded: false,
        error: "Böyle bir kullanıcı bulunamadı"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log("Password mismatch");
      return res.status(401).json({
        succeeded: false,
        error: "Şifre yanlış"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    let redirectUrl = "/";
    switch (user.role) {
      case "admin":
        redirectUrl = "/admin/dashboard";
        break;
      case "operator":
        redirectUrl = "/operator/dashboard";
        break;
      case "student":
        redirectUrl = "/student/dashboard";
        break;
    }

    const userToSend = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(200).json({
      succeeded: true,
      user: userToSend,
      redirectUrl
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      succeeded: false,
      error: "Giriş işlemi sırasında bir hata oluştu"
    });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie('jwt', '', {
      maxAge: 1,
      httpOnly: true
    });
    res.redirect('/');
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error: "Çıkış yapılırken bir hata oluştu"
    });
  }
};

const getDashboardPage = async (req, res) => {
  try {
    let labId = req.query.labs || null; // Default to null if no labId is provided
    let lab = null;
    let filter = {};

    if (labId) {
      lab = await Lab.findOne({ _id: labId });
      if (lab) {
        filter = { lab: lab._id }; // Apply filter if the lab exists
      }
    } else {
      // If no labId, select the first lab as default
      lab = await Lab.findOne();
      if (lab) {
        labId = lab._id; // Set the first lab as the active one
        filter = { lab: lab._id };
      }
    }

    const computers = await Computer.find(filter); // Fetch computers for the selected lab
    const labs = await Lab.find(); // Fetch all labs

    // Render the template with the data
    res.status(200).render("dashboard", {
      computers,
      labs,
      lab, // Ensure lab is passed to the view, even if it's null
      labId,
      link: 'dashboard',
    });
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error,
    });
  }
};

const getLabs = async (req, res) => {
  try {
    const categoryId = req.query.categories;

    let category;

    if (categoryId) {
      category = await Lab.findOne({ _id: categoryId });
    } else {
      category = await Lab.findOne(); // Fetch the first category if categoryId is not provided
    }

    // Filter based on the category found
    let filter = {};
    if (category) {
      filter = { category: category._id };
    }

    const computers = await Computer.find(filter);
    const categories = await Lab.find();

    // Render the template
    res.status(200).render("labs", {
      computers,
      categories,
      category,
      categoryId,
      link: 'labs',
    });
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error,
    });
  }
};

const getComputer = async (req, res) => {
  try {
    const computer = await Computer.findById( {_id: req.params.id});
    res.status(200).render("computer", {
      computer,
      link : 'labs'
    })
  } catch (error) {
    res.status(400).json({
      succeded : false,
      error
    })
  }
};

const createLab = async (req, res) => {
  try {
    const { name, description, capacity, isOpen, closingTime } = req.body;

    const lab = await Lab.create({
      name,
      description,
      capacity,
      isOpen,
      closingTime
    });

    res.status(201).json({
      succeeded: true,
      lab
    });
  } catch (error) {
    console.error("Error creating lab:", error);
    res.status(500).json({
      succeeded: false,
      error: "An error occurred while creating the lab"
    });
  }
};

const handleRFID = async (req, res) => {
  try {
    const { rfid_id } = req.body;

    // RFID ile eşleşen öğrenci bulun
    const student = await User.findOne({ rfid_id });

    if (!student) {
      return res.status(404).json({
        rfid_succeeded: false,
        message: "Öğrenci bulunamadı"
      });
    }

    // Öğrencinin daha önce kaydedilip kaydedilmediğini kontrol et
    const existingRecord = await ScannedStudent.findOne({ studentNumber: student.studentNumber });

    if (existingRecord) {
      // Eğer öğrenci daha önce kaydedildiyse
      return res.status(400).json({
        rfid_succeeded: false,
        message: "Bu öğrenci daha önce kartını okuttu."
      });
    }

    // Yeni instance oluştur ve veritabanına kaydet
    const scannedStudent = new ScannedStudent({
      studentNumber: student.studentNumber,
      name: student.name,
      lastname: student.lastname
    });

    await scannedStudent.save();

    res.redirect('/operator/scannedStudent'); // Listeleme sayfasına yönlendirme
  } catch (error) {
    console.error("RFID işleme hatası:", error);
    res.status(500).json({
      rfid_succeeded: false,
      error: "Bir hata oluştu"
    });
  }
};



export { createUser, loginUser, logout, getDashboardPage, getComputer, getLabs, createLab, handleRFID};

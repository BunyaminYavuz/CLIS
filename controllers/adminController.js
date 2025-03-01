import User from "../models/userModel.js";
import Computer from "../models/computerModel.js";
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import Announcement from "../models/announcementModel.js";
import Lab from "../models/labModel.js";

const getDashboard = async (req, res) => {
  try {
    // Fetch users, computers, and labs
    const [users, computers, labs] = await Promise.all([
      User.find(),
      Computer.find().populate('lab'),
      Lab.find() // Fetch all labs
    ]);

    // User statistics
    const userCount = users.length;
    const studentCount = users.filter(user => user.role === 'student').length;
    const operatorCount = users.filter(user => user.role === 'operator').length;

    // Active sessions
    const activeSessions = users
      .filter(user => user.currentComputer)
      .map(user => {
        const session = user.labUsageHistory.find(h => !h.endTime);
        const computer = computers.find(c => 
          c._id.toString() === user.currentComputer.toString()
        );
        return {
          _id: session._id,
          user: {
            name: user.name,
            lastname: user.lastname,
            studentId: user.studentId
          },
          computer: {
            name: computer?.name || 'Bilinmiyor',
            category: {
              name: computer?.lab?.name || 'Bilinmiyor'
            }
          },
          startTime: session.startTime
        };
      });

    // Computer and lab statistics
    const totalComputers = computers.length;
    const activeComputers = activeSessions.length;
    const labCount = labs.length;

    // Laboratuvar bazında bilgisayar durumları
    const computersByLab = labs.map(lab => {
      const labComputers = computers.filter(c => 
        c.lab && c.lab._id.toString() === lab._id.toString()
      );
      const activeCount = activeSessions.filter(session => 
        session.computer.category.name === lab.name
      ).length;

      return {
        name: lab.name,
        totalCount: labComputers.length,
        activeCount
      };
    });

    // Bugünkü oturumlar
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = users.reduce((total, user) => {
      return total + user.labUsageHistory.filter(session => 
        new Date(session.startTime) >= today
      ).length;
    }, 0);

    // Bugünkü toplam süre
    const todayTotalDuration = users.reduce((total, user) => {
      return total + user.labUsageHistory.reduce((sum, session) => {
        if (new Date(session.startTime) >= today) {
          const endTime = session.endTime ? new Date(session.endTime) : new Date();
          return sum + (endTime - new Date(session.startTime));
        }
        return sum;
      }, 0);
    }, 0);

    res.render('admin/dashboard', {
      link: 'admin-dashboard',
      userCount,
      studentCount,
      operatorCount,
      activeSessions,
      totalComputers,
      activeComputers,
      labCount,
      computersByLab,
      todaySessions,
      todayTotalDuration,
      formatDuration: (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}s ${minutes}dk`;
      },
      formatTime: (date) => {
        return new Date(date).toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      labs
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      succeeded: false,
      error: "Bir hata oluştu"
    });
  }
};

const getReports = async (req, res) => {
  try {
    const labUsage = await User.aggregate([
      {
        $unwind: "$labUsageHistory"
      },
      {
        $group: {
          _id: "$studentNumber",
          totalUsage: {
            $sum: {
              $subtract: ["$labUsageHistory.endTime", "$labUsageHistory.startTime"]
            }
          },
          usageCount: { $sum: 1 }
        }
      }
    ]);

    console.log("Lab Usage Data:", labUsage);

    res.render('admin/reports', {
      labUsage,
      link: 'admin-reports'
    });
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error: error.message
    });
  }
};

const generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    const labUsage = await User.aggregate([
      {
        $unwind: "$labUsageHistory"
      },
      {
        $match: {
          "labUsageHistory.startTime": {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $lookup: {
          from: "computers",
          localField: "labUsageHistory.computer",
          foreignField: "_id",
          as: "computerDetails"
        }
      },
      {
        $unwind: "$computerDetails"
      },
      {
        $group: {
          _id: {
            studentNumber: "$studentNumber",
            name: "$name",
            lastname: "$lastname",
            computer: "$computerDetails.name",
            lab: "$computerDetails.lab.name",
            operator: "$labUsageHistory.operator",
          },
          totalUsage: {
            $sum: {
              $subtract: ["$labUsageHistory.endTime", "$labUsageHistory.startTime"]
            }
          },
          usageCount: { $sum: 1 },
          startTime: { $first: "$labUsageHistory.startTime" },
          endTime: { $last: "$labUsageHistory.endTime" }
        }
      }
    ]);

    console.log("Lab Usage Data:", labUsage);

    // Create a PDF document
    const doc = new PDFDocument();
    const stream = new PassThrough();
    doc.pipe(stream);

    // Add title and metadata
    doc.fontSize(20).text('Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date Range: ${startDate} to ${endDate}`, { align: 'right' });
    doc.text(`Generated by: ${req.user.name}`, { align: 'right' });
    doc.moveDown();

    // Add table headers
    doc.fontSize(12).text('Student Number   Name   Surname   Start Date   End Date   Lab Name   Computer Name   Operator Name');
    doc.moveDown();

    // Add report data
    labUsage.forEach(report => {
      doc.text(`${report._id.studentNumber}   ${report._id.name}   ${report._id.lastname}   ${report.startTime.toISOString()}   ${report.endTime.toISOString()}   ${report._id.lab}   ${report._id.computer}   ${report._id.operator}`);
    });

    doc.end();

    // Set the response headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    stream.pipe(res);
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({
      succeeded: false,
      error: error.message
    });
  }
};

const createOperator = async (req, res) => {
  try {
    const { name, lastname, email, password } = req.body;

    // Operator rolü ile yeni kullanıcı oluştur
    const operator = await User.create({
      name,
      lastname,
      email,
      password,
      role: 'operator'
    });

    res.status(201).json({
      succeeded: true,
      message: "Operatör başarıyla oluşturuldu"
    });
  } catch (error) {
    let errors = {};

    if (error.code === 11000) {
      errors.email = "Bu email adresi zaten kullanılıyor";
    }

    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
    }

    res.status(400).json({
      succeeded: false,
      errors
    });
  }
};

const createComputer = async (req, res) => {
  try {
    const { name, labId, specs, location } = req.body;

    // Check if a computer with the same name already exists
    const existingComputer = await Computer.findOne({ name });
    if (existingComputer) {
      return res.status(400).json({
        succeeded: false,
        error: "Bu bilgisayar adı zaten mevcut."
      });
    }

    const computer = await Computer.create({
      name,
      lab: labId,
      specs,
      location
    });

    res.status(201).json({
      succeeded: true,
      computer
    });
  } catch (error) {
    console.error("Bilgisayar ekleme hatası:", error);
    res.status(500).json({
      succeeded: false,
      error: "Bilgisayar eklenirken bir hata oluştu"
    });
  }
};

const updateComputerStatus = async (req, res) => {
    try {
        const { computerId, status, notes } = req.body;

        const computer = await Computer.findByIdAndUpdate(
            computerId,
            {
                status,
                notes,
                $push: {
                    maintenanceHistory: {
                        date: new Date(),
                        description: notes,
                        technician: req.user.name
                    }
                }
            },
            { new: true }
        );

        res.status(200).json({
            succeeded: true,
            message: "Bilgisayar durumu güncellendi",
            computer
        });
    } catch (error) {
        console.error("Bilgisayar güncelleme hatası:", error);
        res.status(500).json({
            succeeded: false,
            error: "Bilgisayar güncellenirken bir hata oluştu"
        });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, description, capacity, schedule } = req.body;

        const category = await Category.create({
            name,
            description,
            capacity,
            schedule: {
                openDays: schedule.openDays,
                openHours: schedule.openHours
            }
        });

        res.status(201).json({
            succeeded: true,
            message: "Laboratuvar başarıyla oluşturuldu",
            category
        });
    } catch (error) {
        console.error("Laboratuvar oluşturma hatası:", error);
        res.status(500).json({
            succeeded: false,
            error: "Laboratuvar oluşturulurken bir hata oluştu"
        });
    }
};

const createLab = async (req, res) => {
  try {
    const { name, description, location, capacity, closingTime } = req.body;
    
    // Convert isOpen to a boolean
    const isOpen = req.body.isOpen === 'true'; // This will be true if the checkbox is checked

    const lab = await Lab.create({
      name,
      description,
      location,
      capacity,
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

// Oturum sonlandırma endpoint'i
const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = await User.findOne({
      'labUsageHistory._id': sessionId
    });

    if (!user) {
      return res.status(404).json({ error: 'Oturum bulunamadı' });
    }

    const session = user.labUsageHistory.id(sessionId);
    session.endTime = new Date();
    user.currentComputer = null;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error("End session error:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
};

// Create an announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    const announcement = await Announcement.create({
      title,
      content
    });

    res.status(201).json({
      succeeded: true,
      message: "Announcement created successfully",
      announcement
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({
      succeeded: false,
      error: "An error occurred while creating the announcement"
    });
  }
};

// Get all announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({
      succeeded: true,
      announcements
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({
      succeeded: false,
      error: "An error occurred while fetching announcements"
    });
  }
};

const getLabDetails = async (req, res) => {
  try {
    const labId = req.params.id;
    const lab = await Lab.findById(labId).populate('computers');

    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }

    // Fetch computers associated with the lab
    const computers = await Computer.find({ lab: labId }); // Fetch computers for the specific lab

    res.render('admin/lab-details', {
      lab,
      computers, // Pass computers to the view
      link: 'admin-lab-details'
    });
  } catch (error) {
    console.error("Error fetching lab details:", error);
    res.status(500).json({ error: "An error occurred while fetching lab details" });
  }
};

const getLabs = async (req, res) => {
  try {
    const labs = await Lab.find(); // Fetch all labs
    res.render('admin/labs', { labs, link: 'admin-labs' }); // Render the labs view
  } catch (error) {
    console.error("Error fetching labs:", error);
    res.status(500).json({ error: "An error occurred while fetching labs" });
  }
};

const getAddComputerPage = async (req, res) => {
  try {
    const labs = await Lab.find(); // Fetch all labs
    res.render('admin/addComputer', {
      labs, // Pass labs to the view
      link: 'add-computer'
    });
  } catch (error) {
    console.error("Error fetching labs:", error);
    res.status(500).json({
      succeeded: false,
      error: "An error occurred while fetching labs"
    });
  }
};

export { getDashboard, getReports, generateReport, createOperator, createComputer, updateComputerStatus, createCategory, createLab, endSession, createAnnouncement, getAnnouncements, getLabDetails, getLabs, getAddComputerPage }; 
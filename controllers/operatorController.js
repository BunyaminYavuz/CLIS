import User from "../models/userModel.js";
import Computer from "../models/computerModel.js";
import ScannedStudent from "../models/scannedStudent.js";
import Lab from "../models/labModel.js";

const getDashboard = async (req, res) => {
  try {
    const [computers, labs] = await Promise.all([
      Computer.find().populate('lab'),
      Lab.find()
    ]);

    // Öğrencileri getir
    const students = await User.find({ role: 'student' });
    
    res.render('operator/dashboard', {
      computers,
      students,
      labs,
      link: 'operator-dashboard'
    });
  } catch (error) {
    console.error("Operator dashboard error:", error);
    res.status(500).json({
      succeeded: false,
      error: "Bir hata oluştu"
    });
  }
};


const scannedStudent = async (req, res) => {
  try {
    const students = await ScannedStudent.find().sort({ createdAt: -1 }); 

    res.render("operator/scannedStudent", {
      rfid_succeeded: students.length > 0,
      students,
      user: req.user,
      link: "operator-scannedStudent"
    });
  } catch (error) {
    console.error("RFID student error:", error);
    res.status(500).render("operator/scannedStudent", {
      rfid_succeeded: false,
      students: [],
      user: req.user,
      link: "rfid-student"
    });
  }
};

const assignComputer = async (req, res) => {
  try {
    const { computerId, studentId } = req.body;

    // Bilgisayarı ve öğrenciyi bul
    const computer = await Computer.findById(computerId);
    const student = await User.findById(studentId);

    if (!computer || !student) {
      return res.status(404).json({
        succeeded: false,
        error: "Bilgisayar veya öğrenci bulunamadı"
      });
    }

    if (computer.isUsed) {
      return res.status(400).json({
        succeeded: false,
        error: "Bu bilgisayar zaten kullanımda"
      });
    }

    // Bilgisayarı kullanıma al
    computer.isUsed = true;
    await computer.save();

    // Öğrencinin lab kullanım geçmişine ekle
    const labSession = {
      computer: computerId,
      startTime: new Date(),
      operator: req.user._id
    };

    student.labUsageHistory.push(labSession);
    student.currentComputer = computerId;
    await student.save();

    res.status(200).json({
      succeeded: true,
      message: "Bilgisayar başarıyla atandı"
    });
  } catch (error) {
    console.error("Atama hatası:", error);
    res.status(500).json({
      succeeded: false,
      error: "Bilgisayar atanırken bir hata oluştu"
    });
  }
};

const endSession = async (req, res) => {
  try {
    const { computerId, studentId } = req.body;

    // Bilgisayarı ve öğrenciyi bul
    const computer = await Computer.findById(computerId);
    const student = await User.findById(studentId);

    if (!computer || !student) {
      return res.status(404).json({
        succeeded: false,
        error: "Bilgisayar veya öğrenci bulunamadı"
      });
    }

    // Bilgisayarı boşalt
    computer.isUsed = false;
    await computer.save();

    // Öğrencinin aktif oturumunu sonlandır
    const currentSession = student.labUsageHistory.find(
      session => session.computer.toString() === computerId && !session.endTime
    );

    if (currentSession) {
      currentSession.endTime = new Date();
    }

    student.currentComputer = null;
    await student.save();

    res.status(200).json({
      succeeded: true,
      message: "Oturum başarıyla sonlandırıldı"
    });
  } catch (error) {
    console.error("Oturum sonlandırma hatası:", error);
    res.status(500).json({
      succeeded: false,
      error: "Oturum sonlandırılırken bir hata oluştu"
    });
  }
};

const getComputersByLab = async (req, res) => {
  try {
    const labId = req.params.labId;
    const computers = await Computer.find({ lab: labId });

    res.status(200).json({
      succeeded: true,
      computers
    });
  } catch (error) {
    console.error("Error fetching computers:", error);
    res.status(500).json({
      succeeded: false,
      error: "An error occurred while fetching computers"
    });
  }
};


const toggleLabStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOpen } = req.body;

    const updatedLab = await Lab.findByIdAndUpdate(id, { isOpen }, { new: true });

    if (!updatedLab) {
      return res.status(404).json({ success: false, message: 'Lab bulunamadı' });
    }

    if (!isOpen) {
      // Lab kapatılıyorsa, o labdaki tüm bilgisayarların oturumlarını sonlandır
      const computers = await Computer.find({ lab: id, isUsed: true });

      for (const computer of computers) {
        const student = await User.findOne({ currentComputer: computer._id });

        if (student) {
          // Bilgisayarı boşalt
          computer.isUsed = false;
          await computer.save();

          // Öğrencinin aktif oturumunu sonlandır
          const currentSession = student.labUsageHistory.find(
            session => session.computer.toString() === computer._id.toString() && !session.endTime
          );

          if (currentSession) {
            currentSession.endTime = new Date();
          }

          student.currentComputer = null;
          await student.save();
        }
      }
    }

    res.json({ success: true, message: 'Lab durumu güncellendi', lab: updatedLab });
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};


export { getDashboard, assignComputer, endSession, getComputersByLab, toggleLabStatus, scannedStudent }; 
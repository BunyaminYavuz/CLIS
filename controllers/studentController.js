import User from "../models/userModel.js";
import Computer from "../models/computerModel.js";
import Lab from "../models/labModel.js";

// Süre formatlamak için yardımcı fonksiyon
function formatDuration(milliseconds) {
  if (!milliseconds) return '0 dakika';
  
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes} dakika`;
  }
  return `${hours} saat ${minutes} dakika`;
}

// Tarih formatlamak için yardımcı fonksiyon
function formatDate(date) {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleDateString('tr-TR', options);
}

// Saat formatlamak için yardımcı fonksiyon
function formatTime(date) {
  return new Date(date).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Bugünkü kullanım süresini hesaplayan fonksiyon
function calculateTodayUsage(sessions) {
  const now = new Date();
  return sessions.reduce((total, session) => {
    const startTime = new Date(session.startTime);
    const endTime = session.endTime ? new Date(session.endTime) : now;
    return total + (endTime - startTime);
  }, 0);
}

const getStudentDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('labUsageHistory.computer')
      .populate('labUsageHistory.operator');

    const labs = await Lab.find(); // Fetch all labs
    const computers = await Computer.find(); // Fetch all computers

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter today's sessions
    const todaySessions = user.labUsageHistory.filter(session => {
      const startTime = new Date(session.startTime);
      return startTime >= today;
    });

    // Check for active session
    const activeSession = todaySessions.find(session => !session.endTime);

    // Prepare lab computer status
    const labComputerStatus = labs.map(lab => {
      const labComputers = computers.filter(computer => computer.lab && computer.lab.toString() === lab._id.toString());
      const status = labComputers.map(computer => ({
        name: computer.name,
        isUsed: user.labUsageHistory.some(session => 
          session.computer && session.computer.toString() === computer._id.toString() && session.endTime === null
        )
      }));
      return {
        labName: lab.name,
        computers: status
      };
    });

    res.render("student/dashboard", {
      user,
      labs,
      computers,
      todaySessions,
      activeSession,
      labComputerStatus,
      formatDuration,
      formatDate,
      formatTime,
      link: 'student-dashboard',
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    res.status(500).json({
      succeeded: false,
      error: "Bir hata oluştu"
    });
  }
};

// İstatistik hesaplama yardımcı fonksiyonu
function calculateUserStats(history) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Laboratuvar kullanım sayıları
  const labUsage = history.reduce((acc, session) => {
    const labName = session.computer?.lab?.name;
    if (labName) {
      acc[labName] = (acc[labName] || 0) + 1;
    }
    return acc;
  }, {});

  // En çok kullanılan laboratuvar
  const mostUsedLab = Object.entries(labUsage)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  // Saat bazında kullanım yoğunluğu
  const hourlyUsage = history.reduce((acc, session) => {
    const hour = new Date(session.startTime).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  // En yoğun saatler (en çok kullanılan 2 saat)
  const peakHours = Object.entries(hourlyUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([hour]) => `${hour}:00`)
    .join('-');

  // Bugünkü kullanım süresi
  const todayUsage = history.reduce((total, session) => {
    const startTime = new Date(session.startTime);
    if (startTime >= today) {
      const endTime = session.endTime ? new Date(session.endTime) : now;
      return total + (endTime - startTime);
    }
    return total;
  }, 0);

  // Bu ayki kullanım süresi
  const monthlyUsage = history.reduce((total, session) => {
    const startTime = new Date(session.startTime);
    if (startTime >= firstDayOfMonth) {
      const endTime = session.endTime ? new Date(session.endTime) : now;
      return total + (endTime - startTime);
    }
    return total;
  }, 0);

  // Toplam ve ortalama süreler
  const totalDuration = history.reduce((total, session) => {
    if (session.endTime) {
      return total + (new Date(session.endTime) - new Date(session.startTime));
    }
    return total;
  }, 0);

  const avgDuration = history.length ? totalDuration / history.length : 0;
  const avgPerDay = monthlyUsage / (now.getDate()); // Ayın başından beri günlük ortalama

  // Son kullanım bilgileri
  const lastSession = history[history.length - 1];
  const lastLab = lastSession?.computer?.lab?.name;

  return {
    totalDuration,
    avgDuration,
    avgPerDay,
    todayUsage,
    monthlyUsage,
    sessionCount: history.length,
    mostUsedLab,
    peakHours,
    lastUsage: lastSession?.startTime,
    lastLab,
    recentUsage: history.slice(-5).reverse()
  };
}

const getLabHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'labUsageHistory.computer',
        populate: {
          path: 'lab'
        }
      })
      .populate('labUsageHistory.operator');

    // Calculate total duration
    const totalDuration = user.labUsageHistory.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).reduce((total, session) => {
      if (session.endTime) {
        return total + (new Date(session.endTime) - new Date(session.startTime));
      }
      return total;
    }, 0);

    // Calculate average duration
    const avgDuration = user.labUsageHistory.length ? totalDuration / user.labUsageHistory.length : 0;

    res.render('student/lab-history', {
      link: 'lab-history',
      history: user.labUsageHistory,
      totalDuration, // Pass totalDuration to the view
      avgDuration, // Pass avgDuration to the view
      formatDuration,
      formatDate,
      formatTime
    });
  } catch (error) {
    console.error("Lab history error:", error);
    res.status(500).json({
      succeeded: false,
      error: "Bir hata oluştu"
    });
  }
};

const getLabComputerStatus = async (req, res) => {
  try {
    // Tüm laboratuvarları getir
    const labs = await Lab.find();

    // Seçili lab ID'sini al
    const selectedLabId = req.query.labId;

    let selectedLabComputers = null;

    // Eğer bir lab seçildiyse, o laba ait bilgisayarları getir
    if (selectedLabId) {
      const lab = await Lab.findById(selectedLabId).populate('computers');

      if (!lab) {
        return res.status(404).json({ error: "Lab not found" });
      }

      const computers = await Computer.find({ lab: selectedLabId });

      selectedLabComputers = {
        labName: lab.name,
        labStatus: lab.isOpen,
        computers: computers.map(computer => ({
          name: computer.name,
          isUsed: computer.isUsed, // DB'deki gerçek kullanım durumunu al
        })),
        isOpen: lab.isOpen,
        id: lab._id
      };
    }

    res.render("student/lab-computer-status", {
      labs, // Tüm laboratuvarlar
      selectedLabComputers, // Seçili lab varsa bilgisayarlar
      formatDuration,
      formatDate,
      formatTime,
      link: 'lab-computer-status',
    });

  } catch (error) {
    console.error("Error fetching lab computer status:", error);
    res.status(500).json({
      succeeded: false,
      error: "Bir hata oluştu"
    });
  }
};



export { getStudentDashboard, getLabHistory, getLabComputerStatus }; 
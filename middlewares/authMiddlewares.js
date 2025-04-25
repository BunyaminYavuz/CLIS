import User from "../models/userModel.js";
import jwt from "jsonwebtoken"


const checkUser = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            res.locals.user = null;
            return next();
        }

        // Token'ı doğrula
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decodedToken || !decodedToken.userId) {
            res.locals.user = null;
            return next();
        }

        // Kullanıcıyı bul
        const user = await User.findById(decodedToken.userId);
        
        if (!user) {
            res.locals.user = null;
            return next();
        }

        // Kullanıcı bilgilerini locals'a kaydet
        res.locals.user = user;
        next();
    } catch (error) {
        console.error("CheckUser error:", error);
        res.locals.user = null;
        next();
    }
}

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.redirect("/login");
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.redirect("/login");
            }

            const user = await User.findById(decodedToken.userId);
            if (!user) {
                return res.redirect("/login");
            }

            req.user = user;
            next();
        });
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({
            succeeded: false,
            error: "Yetkilendirme hatası"
        });
    }
}

const authenticateRoles = (...roles) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies.jwt;

            if (!token) {
                return res.redirect("/login");
            }

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decodedToken.userId);

            if (!user || !roles.includes(user.role)) {
                return res.status(403).json({
                    succeeded: false,
                    error: "Bu sayfaya erişim yetkiniz yok"
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error("Role auth error:", error);
            return res.redirect("/login");
        }
    };
};


// authMiddleware.js içinde tanımlı middleware fonksiyonu
const authenticateRfid = () => {
    return async (req, res, next) => {
        try {
            const checksum = req.body.rfid_checksum;
            console.log("Received RFID checksum:", checksum);
            console.log("process.env.RFID_CHECKSUM:", process.env.RFID_CHECKSUM);

            if (process.env.RFID_CHECKSUM == checksum) {
                // Doğru RFID checksum eşleştiğinde bir sonraki middleware'e geç
                next();
            } else {
                // Geçersiz RFID durumu
                console.log("RFID checksum doğrulanamadı.");
                return res.status(401).send("Unauthorized Access: Invalid RFID");
            }

        } catch (error) {
            console.error("RFID authentication error:", error);
            return res.status(500).send("Server Error");
        }
    };
};



export {authenticateToken,checkUser, authenticateRoles, authenticateRfid}
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

export {authenticateToken,checkUser, authenticateRoles}
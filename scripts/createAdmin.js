import mongoose from "mongoose";
import User from "../models/userModel.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import conn from "../db.js";

dotenv.config({path: "../.env"});
conn()

const createAdmin = async () => {
    try {
        
        // Admin bilgileri
        const adminData = {
            name: "Admin",
            lastname: "User",
            email: "admin2@clis.com",
            password: "admin123", // Güçlü bir şifre kullanın
            role: "admin",
            rfid_id: 0
        };

        // Eğer bu email ile admin varsa, oluşturma
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log("Bu email ile bir admin zaten var!");
            process.exit(0);
        }

        // Admin kullanıcısını oluştur
        const admin = await User.create(adminData);
        
        console.log("Admin başarıyla oluşturuldu:");
        console.log(`Email: ${adminData.email}`);
        console.log(`Şifre: ${adminData.password}`);

    } catch (error) {
        console.error("Admin oluşturma hatası:", error);
    } finally {
        // Bağlantıyı kapat
        await mongoose.connection.close();
    }
};

// Script'i çalıştır
createAdmin(); 
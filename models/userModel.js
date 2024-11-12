import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "The name field is required!"],
      validate: [validator.isAlpha, "Only letters"]
    },
    lastname: {
      type: String,
      required: [true, "The lastname field is required!"],
      validate: [validator.isAlpha, "Only letters"]
    },
    email: {
      type: String,
      required: [true, "The email field is required!"],
      unique: true,
      validate: [validator.isEmail, "Valid email is required!"]
    },
    password: {
      type: String,
      required: [true, "The password field is required!"],
      minLength: [4, "At least 4 characters!"]
    },
    profilePhoto: {
      type: String,
      default: "/images/bgi.png", // Kullanıcının profil fotoğrafı
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user", // Kullanıcı rolü (admin veya kullanıcı)
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deactivated"],
      default: "active", // Hesap durumu
    },
    lastLabEntryTime: {
      type: Date,
      default: null, // Kullanıcının son laboratuvar giriş zamanı
    },
    currentLabSession: {
      type: Schema.Types.ObjectId,
      ref: "LabSession",
      default: null, // Kullanıcının şu anki aktif oturumu
    },
    usageDurationToday: {
      type: Number,
      default: 0, // Bugünkü kullanım süresi (dakika olarak)
    },
    labStatistics: {
      totalLabHoursThisMonth: {
        type: Number,
        default: 0, // Bu ayki toplam laboratuvar kullanım süresi
      },
      mostFrequentLabs: {
        type: [String],
        default: [], // En sık kullanılan laboratuvarlar
      },
      recentPCUsage: {
        type: [String],
        default: ["01/01/2024 - 01/01/2024 3:52PM COM1-LAB1","02/01/2024 - 01/02/2024 2:45PM COM10-LAB2"], // Son kullanılan bilgisayarlar
      },
    },
    notifications: {
      type: [String],
      default: [], // Kullanıcının bildirimleri ve duyuruları
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next(); // Eğer parola değişmemişse, hashleme yapma
  }
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

const User = mongoose.model("User", userSchema);

export default User;
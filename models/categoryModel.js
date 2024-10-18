import mongoose from "mongoose";

const { Schema } = mongoose

const categorySchema = new Schema({
    name : {
        type : String,
        unique : true,
        required : true
    },
    description: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        default: 0
    },
    isOpen: {
        type: Boolean,
        default: true
    },
    availableComputers: {
        type: Number,
        default: 0
    },
    labRules: {
        type: String,
        required: false
    },
    schedule: {
        openDays: {
            type: [String],  // Açık olduğu günleri belirtmek için (örn: ["Monday", "Wednesday", "Friday"])
            required: true
        },
        openHours: {
            type: String,  // Açık olduğu saatler (örn: "08:00 - 20:00")
            required: true
        }
    },
    securityWarnings: {
        type: String, // Güvenlik uyarıları (örn: "Yangın çıkışları şu yerlerde bulunur.")
        required: false
    },
    emergencyContact: {
        type: String,  // Acil durumda ulaşılabilecek kişi veya numara
        required: false
    }
    
})


const Category = mongoose.model("Category", categorySchema)

export default Category;
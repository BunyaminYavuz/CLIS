import mongoose from "mongoose";

const { Schema } = mongoose

const computerSchema = new Schema({
    name : {
        type : String,
        required : true,
        unique: true
    },
    description : {
        type : String,
        required: false,
        trim : true
    },
    uploadedAt : {
        type : Date,
        default : Date.now
    },

    lab: {
        type: Schema.Types.ObjectId,
        ref: 'Lab',
        required: true
    },
    specs: {
        processor: String,      // İşlemci bilgisi
        ram: String,           // RAM miktarı
        storage: String,       // Depolama bilgisi
        os: String,           // İşletim sistemi
        monitor: String       // Monitör bilgisi
    },
    status: {
        type: String,
        enum: ["active", "maintenance", "broken"],
        default: "active"
    },
    location: {
        row: Number,          // Laboratuvardaki sıra numarası
        column: Number        // Laboratuvardaki kolon numarası
    },
    isUsed : {
        type:Boolean,
        required:true,
        default:false
    },
    maintenanceHistory: [{
        date: Date,
        description: String,
        technician: String
    }],
    notes: String            // Ek notlar
}, {
    timestamps: true
})


const Computer = mongoose.model("Computer", computerSchema)

export default Computer;
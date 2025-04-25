import mongoose from 'mongoose';

const { Schema } = mongoose;

const scannedStudentSchema = new Schema({
  studentNumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const ScannedStudent = mongoose.model('ScannedStudent', scannedStudentSchema);
export default ScannedStudent;

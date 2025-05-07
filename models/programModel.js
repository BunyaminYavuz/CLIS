import mongoose from 'mongoose';

const { Schema } = mongoose;

const programSchema = new Schema({
  operator: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Eğer operatörlerle ilişkilendirme varsa
    required: true,
  },
  lab: {
    type: Schema.Types.ObjectId,
    ref: 'Lab', // Hangi lab için program olduğunu belirtmek için
    required: true,
  },
  day: {
    type: String,
    enum: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'],
    required: true,
  },
  hour: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

const Program = mongoose.model('Program', programSchema);
export default Program;
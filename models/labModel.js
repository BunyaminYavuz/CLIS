import mongoose from 'mongoose';

const { Schema } = mongoose;

const labSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  computers: [{
    type: Schema.Types.ObjectId,
    ref: 'Computer'
  }],
  isOpen: {
    type: Boolean,
    default: true
  },
  /*
  closingTime: {
    type: String,
    required: function() { return this.isOpen; }
  },
  */
  location: { type: String, required: true },
  equipment: { type: [String] },
  operatingHours: { type: String },
  contact: { type: String }
}, {
  timestamps: true
});

const Lab = mongoose.model('Lab', labSchema);
export default Lab; 
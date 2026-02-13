import mongoose, { Schema } from 'mongoose';

const ChoirSchema = new Schema({
  year: { 
    type: Number, 
    required: true,
    min: [2000, 'Year must be 2000 or later'],
    max: [2100, 'Year cannot exceed 2100']   
  },
  month: { 
    type: Number, 
    required: true,
    min: 0,
    max: 11 
  },
  day: { 
    type: Number, 
    required: true,
    min: 1,
    max: 31 
  },
  type: { 
    type: String, 
    enum: ['practice', 'event'], 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  time: { 
    type: String, 
    required: true,
    trim: true 
  }
}, { 
  timestamps: true 
});

//index to optimize queries by date
//ChoirSchema.index({ year: 1, month: 1, day: 1 });

const Choir = mongoose.model('Choir', ChoirSchema);

export { Choir };
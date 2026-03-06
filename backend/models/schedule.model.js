import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

const scheduleSchema = new mongoose.Schema({
  date: {
    type: String, // e.g. "JANUARY 17"
    required: true
  },
  events: [eventSchema]
}, {
  timestamps: true
});

const Schedule= mongoose.model('Schedule', scheduleSchema);
export default Schedule;

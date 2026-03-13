import {model, Schema} from "mongoose";

const slotSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: "Appointment",
    default: null
  }
});

slotSchema.index({ date: 1, startTime: 1, endTime: 1 }, { unique: true });

const Slot=model('Slot',slotSchema);
export {Slot};
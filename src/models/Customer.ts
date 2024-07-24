import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  username: String,
  name: String,
  address: String,
  birthdate: Date,
  email: String,
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
});

export const Customer = mongoose.model('Customer', customerSchema);


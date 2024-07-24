import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  account_id: String,
  limit: Number,
  products: [String],
});

export const Account = mongoose.model('Account', accountSchema);
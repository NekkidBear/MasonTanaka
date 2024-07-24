import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  date: Date,
  amount: Number,
  transaction_code: String,
  symbol: String,
  price: Number,
  total: Number,
});

const transactionBucketSchema = new mongoose.Schema({
  account_id: Number,
  transaction_count: Number,
  bucket_start_date: Date,
  bucket_end_date: Date,
  transactions: [transactionSchema],
});

export const TransactionBucket = mongoose.model('TransactionBucket', transactionBucketSchema, 'transactions');
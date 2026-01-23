import mongoose from 'mongoose';

const collection = 'Users';

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['identification', 'address', 'account', 'other'],
    default: 'other'
  }
}, { _id: false });

const schema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'premium']
  },
  pets: {
    type: [
      {
        _id: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Pets'
        }
      }
    ],
    default: []
  },
  documents: {
    type: [documentSchema],
    default: []
  },
  last_connection: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'suspended'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

schema.index({ email: 1 }, { unique: true });
schema.index({ last_connection: -1 });
schema.index({ 'documents.type': 1 });

const userModel = mongoose.model(collection, schema);

export default userModel;
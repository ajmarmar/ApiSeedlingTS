import * as mongoose from 'mongoose';
import User from './user';

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  name: { type: String, required: true },
  mimeType: String,
  repositoryPath: String,
  resource: String,
  idResource: { type: mongoose.Types.ObjectId },
  compressed: { type: Boolean, default: false },
  createdBy: { type: mongoose.Types.ObjectId, ref: User },
}, {
  timestamps: true,
});

fileSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.id;
    ret._id = ret._id.toString();
    ret.idResource = ret.idResource.toString();
  }
});

fileSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.id;
    ret._id = ret._id.toString();
    ret.idResource = ret.idResource.toString();
  }
});

// eslint-disable-next-line @typescript-eslint/naming-convention
const File = mongoose.model('File', fileSchema);

export default File;

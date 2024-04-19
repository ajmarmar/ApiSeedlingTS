import * as mongoose from 'mongoose';
import User from './user';

const roleSchema = new mongoose.Schema({
    role: { type: String, required: true },
    resource: { type: String, required: true },
    action: { type: String, required: true },
    attributes: { type: String, required: true },
    createdBy: { type: mongoose.Types.ObjectId, ref: User },
    lastModBy: { type: mongoose.Types.ObjectId, ref: User }
  }, {
    timestamps: true,
  });
  
  roleSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
      ret._id = ret._id.toString(); 
      if (ret.createdBy) {
        ret.createdBy = ret.createdBy.toString(); 
      }
      if (ret.lastModBy) {
        ret.lastModBy = ret.lastModBy.toString(); 
      }
    }
  });

  roleSchema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => {
      ret._id = ret._id.toString(); 
      if (ret.createdBy) {
        ret.createdBy = ret.createdBy.toString(); 
      }
      if (ret.lastModBy) {
        ret.lastModBy = ret.lastModBy.toString(); 
      }
    }
  });


  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Role = mongoose.model('Role', roleSchema);
  
  export default Role;
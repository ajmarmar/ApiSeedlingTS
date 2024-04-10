import * as mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    role: { type: String, required: true },
    resource: { type: String, required: true },
    action: { type: String, required: true },
    attributes: { type: String, required: true }
  }, {
    timestamps: true,
  });
  
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Role = mongoose.model('Role', roleSchema);
  
  export default Role;
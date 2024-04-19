import * as bcrypt from 'bcryptjs';
import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  firstName: String,
  lastName: String,
  inactive: { type: Boolean, default: false },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
  lastModBy: { type: mongoose.Types.ObjectId, ref: 'User' },
  roles: [ String ]
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const user: any = this;
    if (!user.isModified('password') || !user.password) { return next(); }
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
  } catch (error: any) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    ret._id = ret._id.toString(); 
    if (ret.createdBy) {
      ret.createdBy = ret.createdBy.toString(); 
    }
    if (ret.lastModBy) {
      ret.lastModBy = ret.lastModBy.toString(); 
    }
  }
});

userSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
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
const User = mongoose.model('User', userSchema);

export default User;

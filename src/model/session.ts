import * as mongoose from 'mongoose';
import User from './user';
import config from 'config';
import { toMs } from 'ms-typescript';
import { TOKEN_EXPIRATION_TIME_DEFAULT } from '../utils/constants';

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, required: true, ref: User },
  token: { type: String, unique: true, required: true },
  server: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: toMs(config.get('server.secure.tokenExpirationTime') || TOKEN_EXPIRATION_TIME_DEFAULT) / 1000
  },
  type: {
    type: String,
    enum: ['API', 'Web'],
    required: true,
    default: 'API',
  },
  logoutAt: {
    type: Date,
    default: null
  }
});

// eslint-disable-next-line @typescript-eslint/naming-convention
const Session = mongoose.model('Session', sessionSchema);

export default Session;

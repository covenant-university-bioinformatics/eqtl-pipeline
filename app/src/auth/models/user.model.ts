import * as mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export enum UserRoles {
  ADMIN = 'admin',
  SCIENTIST = 'scientist',
}

//Interface that describe the properties that are required to create a new user
interface UserAttrs {
  username: string;
  email: string;
  role: UserRoles;
  emailConfirmed: boolean;
}

// An interface that describes the extra properties that a ticket model has
//collection level methods
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): Promise<UserDoc>;
}

//An interface that describes a properties that a document has
export interface UserDoc extends mongoose.Document {
  id: string;
  username: string;
  email: string;
  role: UserRoles;
  emailConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

const userSchema = new mongoose.Schema<UserDoc, UserModel>(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      minlength: [5, 'username must not be less than 5'],
      maxlength: [20, 'username must not be more than 20'],
    },

    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },

    role: {
      type: String,
      enum: [UserRoles.SCIENTIST, UserRoles.ADMIN],
      default: UserRoles.SCIENTIST,
    },

    emailConfirmed: {
      type: Boolean,
    },

    version: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: 'version',
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

//increments version when document updates
//enable optimistic concurrency control
//set versionKey to version for occ to use version
userSchema.set('versionKey', 'version');
// @ts-ignore
userSchema.plugin(updateIfCurrentPlugin);

//collection level methods
userSchema.statics.build = async (attrs: UserAttrs) => {
  return await User.create(attrs);
};

//create mongoose model
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };

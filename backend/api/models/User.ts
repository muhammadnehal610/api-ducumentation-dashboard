import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser } from '../../types';

// Extend the IUser interface to include Mongoose's Document properties
export interface IUserDocument extends IUser, Document {
    // Mongoose adds its own `id` virtual getter, so the `id` from IUser is fine.
}

const UserSchema: Schema<IUserDocument> = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: true,
        select: false, // Don't return password by default
    },
    role: {
        type: String,
        enum: ['frontend', 'backend'],
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
    toJSON: { 
        virtuals: true,
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
        }
    },
    toObject: {
        virtuals: true,
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
        }
    }
});

// Hash password before saving
UserSchema.pre<IUserDocument>('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);

export default User;

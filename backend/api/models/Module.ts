import mongoose, { Schema, Document, Model } from 'mongoose';

interface IModule extends Document {
    name: string;
    description?: string;
}

const ModuleSchema: Schema<IModule> = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

const Module: Model<IModule> = mongoose.model<IModule>('Module', ModuleSchema);

export default Module;

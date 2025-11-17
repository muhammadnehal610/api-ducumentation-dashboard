import mongoose, { Schema, Document, Model } from 'mongoose';

interface IModule extends Document {
    name: string;
    description?: string;
    serviceId: mongoose.Types.ObjectId;
}

const ModuleSchema: Schema<IModule> = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
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

// Ensure module name is unique within the scope of a service
ModuleSchema.index({ name: 1, serviceId: 1 }, { unique: true });

const Module: Model<IModule> = mongoose.model<IModule>('Module', ModuleSchema);

export default Module;
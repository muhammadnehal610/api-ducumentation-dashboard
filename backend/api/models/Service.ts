import mongoose, { Schema, Document, Model } from 'mongoose';

interface IService extends Document {
    name: string;
    description?: string;
}

const ServiceSchema: Schema<IService> = new Schema({
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

const Service: Model<IService> = mongoose.model<IService>('Service', ServiceSchema);

export default Service;
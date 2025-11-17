import mongoose, { Schema, Document, Model } from 'mongoose';

interface IErrorCode extends Document {
    code: number;
    meaning: string;
    context: string;
    serviceId: mongoose.Types.ObjectId;
}

const ErrorCodeSchema: Schema<IErrorCode> = new Schema({
    code: {
        type: Number,
        required: true,
    },
    meaning: {
        type: String,
        required: true
    },
    context: {
        type: String,
        required: true
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

// Ensure code is unique within a service
ErrorCodeSchema.index({ code: 1, serviceId: 1 }, { unique: true });

const ErrorCode: Model<IErrorCode> = mongoose.model<IErrorCode>('ErrorCode', ErrorCodeSchema);

export default ErrorCode;
import mongoose, { Schema, Document, Model } from 'mongoose';

interface IErrorCode extends Document {
    code: number;
    meaning: string;
    context: string;
}

const ErrorCodeSchema: Schema<IErrorCode> = new Schema({
    code: {
        type: Number,
        required: true,
        unique: true
    },
    meaning: {
        type: String,
        required: true
    },
    context: {
        type: String,
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

const ErrorCode: Model<IErrorCode> = mongoose.model<IErrorCode>('ErrorCode', ErrorCodeSchema);

export default ErrorCode;


import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the type and an array for enum validation
export type CardType = 'baseUrl' | 'auth' | 'version' | 'custom';
const cardTypeEnum: CardType[] = ['baseUrl', 'auth', 'version', 'custom'];

interface IOverviewCard extends Document {
    title: string;
    content: string;
    icon: string;
    cardType: CardType;
    serviceId: mongoose.Types.ObjectId;
}

const OverviewCardSchema: Schema<IOverviewCard> = new Schema({
    title: { type: String, required: [true, 'Card title is required.'] },
    content: { type: String, required: [true, 'Card content is required.'] },
    icon: { type: String, required: [true, 'Card icon is required.'] },
    cardType: {
        type: String,
        enum: cardTypeEnum,
        required: [true, 'Card type is required.'],
        default: 'custom'
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

const OverviewCard: Model<IOverviewCard> = mongoose.model<IOverviewCard>('OverviewCard', OverviewCardSchema);

export default OverviewCard;

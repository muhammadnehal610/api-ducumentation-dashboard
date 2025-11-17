import mongoose, { Schema, Document, Model } from 'mongoose';

interface IOverviewCard extends Document {
    title: string;
    content: string;
    icon: string;
    iconColor: string;
    isCode?: boolean;
}

const OverviewCardSchema: Schema<IOverviewCard> = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    icon: { type: String, required: true },
    iconColor: { type: String, required: true },
    isCode: { type: Boolean, default: false }
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

import mongoose, { Schema, Document, Model } from 'mongoose';

interface IChange {
    type: 'new' | 'update' | 'breaking' | 'fix';
    description: string;
}

interface IChangelog extends Document {
    version: string;
    date: Date;
    changes: IChange[];
}

const ChangeSchema: Schema<IChange> = new Schema({
    type: {
        type: String,
        enum: ['new', 'update', 'breaking', 'fix'],
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { _id: false });

const ChangelogSchema: Schema<IChangelog> = new Schema({
    version: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        required: true
    },
    changes: [ChangeSchema]
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

const Changelog: Model<IChangelog> = mongoose.model<IChangelog>('Changelog', ChangelogSchema);

export default Changelog;

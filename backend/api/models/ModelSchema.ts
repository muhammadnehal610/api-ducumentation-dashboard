import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface ISchemaField extends Types.Subdocument {
    name: string;
    type: string;
    required: boolean;
    constraints: string;
    description: string;
}

interface IModelSchema extends Document {
    name: string;
    description?: string;
    module: string;
    // FIX: Correctly type `fields` as a Mongoose DocumentArray to expose subdocument array methods like `.id()`.
    fields: mongoose.Types.DocumentArray<ISchemaField>;
}

const SchemaFieldSchema: Schema<ISchemaField> = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, required: true },
    constraints: { type: String, required: true },
    description: { type: String, required: true }
});

const ModelSchemaSchema: Schema<IModelSchema> = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    module: {
        type: String,
        required: true
    },
    fields: [SchemaFieldSchema]
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

const ModelSchema: Model<IModelSchema> = mongoose.model<IModelSchema>('ModelSchema', ModelSchemaSchema);

export default ModelSchema;
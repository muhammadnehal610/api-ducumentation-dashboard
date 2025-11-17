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
    serviceId: mongoose.Types.ObjectId;
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
    },
    description: {
        type: String
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
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

// Ensure schema name is unique within the scope of a service
ModelSchemaSchema.index({ name: 1, serviceId: 1 }, { unique: true });

const ModelSchema: Model<IModelSchema> = mongoose.model<IModelSchema>('ModelSchema', ModelSchemaSchema);

export default ModelSchema;

import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Interface Definitions ---
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE';

interface IField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    description: string;
    exampleValue?: string;
    children?: IField[];
}

interface IResponseExample {
    code: number;
    description: string;
    fields?: IField[];
    body: mongoose.Schema.Types.Mixed;
}

export interface IEndpoint extends Document {
    method: HttpMethod;
    path: string;
    description: string;
    authRequired: boolean;
    serviceId: mongoose.Types.ObjectId;
    moduleId: mongoose.Types.ObjectId;
    pathParams?: IField[];
    headers?: IField[];
    queryParams?: IField[];
    bodyParams?: IField[];
    bodyExample?: string;
    successResponses?: IResponseExample[];
    errorResponses?: IResponseExample[];
}

// --- Schema Definitions ---

const FieldSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['string', 'number', 'boolean', 'object', 'array'], required: true },
    required: { type: Boolean, default: false },
    description: { type: String, default: '' },
    exampleValue: { type: String, default: '' },
}, { _id: false });

// Add recursive children property
FieldSchema.add({ children: { type: [FieldSchema], default: undefined } });

const ResponseExampleSchema: Schema = new Schema({
    code: { type: Number, required: true },
    description: { type: String, required: true },
    fields: { type: [FieldSchema], default: undefined },
    body: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });


const EndpointSchema: Schema<IEndpoint> = new Schema({
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT', 'TRACE'],
        required: true
    },
    path: { type: String, required: true },
    description: { type: String, required: true },
    authRequired: { type: Boolean, default: false },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    moduleId: {
        type: Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    pathParams: { type: [FieldSchema], default: undefined },
    headers: { type: [FieldSchema], default: undefined },
    queryParams: { type: [FieldSchema], default: undefined },
    bodyParams: { type: [FieldSchema], default: undefined },
    bodyExample: { type: String },
    successResponses: { type: [ResponseExampleSchema], default: undefined },
    errorResponses: { type: [ResponseExampleSchema], default: undefined }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            // Rename pathParams to a more generic name for reuse
            if (ret.pathParams) { ret.fields = ret.pathParams; delete ret.pathParams; }
        }
    }
});

const Endpoint: Model<IEndpoint> = mongoose.model<IEndpoint>('Endpoint', EndpointSchema);

export default Endpoint;
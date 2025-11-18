
import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Interface Definitions ---
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE';

interface IParam {
    name: string;
    type: string;
    required: boolean;
    description: string;
    exampleValue?: string;
}

interface IResponseExample {
    code: number;
    description: string;
    bodyType: 'fields' | 'jsonSchema';
    fields?: IParam[];
    bodyJsonSchema?: string;
    body: mongoose.Schema.Types.Mixed;
}

export interface IEndpoint extends Document {
    method: HttpMethod;
    path: string;
    description: string;
    authRequired: boolean;
    serviceId: mongoose.Types.ObjectId;
    moduleId: mongoose.Types.ObjectId;
    pathParams?: IParam[];
    headers?: IParam[];
    queryParams?: IParam[];
    bodyType: 'params' | 'jsonSchema';
    bodyParams?: IParam[];
    bodyJsonSchema?: string;
    bodyExample?: string;
    successResponses?: IResponseExample[];
    errorResponses?: IResponseExample[];
}

// --- Schema Definitions ---

const ParamSchema: Schema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, required: true },
    description: { type: String, required: true },
    exampleValue: { type: String, required: false }
}, { _id: false });

const ResponseExampleSchema: Schema = new Schema({
    code: { type: Number, required: true },
    description: { type: String, required: true },
    bodyType: { type: String, enum: ['fields', 'jsonSchema'], default: 'fields' },
    fields: { type: [ParamSchema], default: undefined },
    bodyJsonSchema: { type: String },
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
    pathParams: { type: [ParamSchema], default: undefined },
    headers: { type: [ParamSchema], default: undefined },
    queryParams: { type: [ParamSchema], default: undefined },
    bodyType: { type: String, enum: ['params', 'jsonSchema'], default: 'params' },
    bodyParams: { type: [ParamSchema], default: undefined },
    bodyJsonSchema: { type: String },
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
        }
    }
});

const Endpoint: Model<IEndpoint> = mongoose.model<IEndpoint>('Endpoint', EndpointSchema);

export default Endpoint;
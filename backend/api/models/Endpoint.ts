import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Interface Definitions ---
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface IParam {
    name: string;
    type: string;
    required: boolean;
    description: string;
}

interface IResponseExample {
    code: number;
    description: string;
    fields?: IParam[];
    body: mongoose.Schema.Types.Mixed;
}

export interface IEndpoint extends Document {
    method: HttpMethod;
    path: string;
    description: string;
    module: string;
    authRequired: boolean;
    headers?: IParam[];
    queryParams?: IParam[];
    bodyParams?: IParam[];
    bodyExample?: string;
    successResponses?: IResponseExample[];
    errorResponses?: IResponseExample[];
}

// --- Schema Definitions ---

const ParamSchema: Schema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, required: true },
    description: { type: String, required: true }
}, { _id: false });

const ResponseExampleSchema: Schema = new Schema({
    code: { type: Number, required: true },
    description: { type: String, required: true },
    fields: { type: [ParamSchema], default: undefined },
    body: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });


const EndpointSchema: Schema<IEndpoint> = new Schema({
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        required: true
    },
    path: { type: String, required: true },
    description: { type: String, required: true },
    module: { type: String, required: true },
    authRequired: { type: Boolean, default: false },
    headers: { type: [ParamSchema], default: undefined },
    queryParams: { type: [ParamSchema], default: undefined },
    bodyParams: { type: [ParamSchema], default: undefined },
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

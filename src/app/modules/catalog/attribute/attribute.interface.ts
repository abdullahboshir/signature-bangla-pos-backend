import { Model, Types, Document } from "mongoose";

export interface IAttribute {
    name: string;
    values: string[];
    businessUnit: Types.ObjectId;
    status: "active" | "inactive";
    createdBy: Types.ObjectId;
}

export type IAttributeDocument = IAttribute & Document;
export type IAttributeModel = Model<IAttributeDocument>;

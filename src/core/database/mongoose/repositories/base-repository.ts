// src/core/database/mongoose/repositories/base-repository.ts
import type {
  Document,
  Model,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";

export interface IRepository<T extends Document> {
  create(data: Partial<T>, options?: any): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findAll(filter?: FilterQuery<T>, options?: any): Promise<T[]>;
  findWithPagination(
    filter: FilterQuery<T>,
    page: number,
    limit: number,
    sort?: any
  ): Promise<{ data: T[]; total: number; page: number; limit: number }>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<number>;
  delete(id: string): Promise<boolean>;
  deleteMany(filter: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
  count(filter?: FilterQuery<T>): Promise<number>;
}

export class BaseRepository<T extends Document> implements IRepository<T> {
  constructor(protected model: Model<T>) { }

  async create(data: Partial<T>, options?: any): Promise<T> {
    const document = new this.model(data);
    await document.save(options);
    return document;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(filter: FilterQuery<T> = {}, options: any = {}): Promise<T[]> {
    return this.model
      .find(filter)
      .sort(options.sort || { createdAt: -1 })
      .exec();
  }

  async findWithPagination(
    filter: FilterQuery<T>,
    page: number,
    limit: number,
    sort: any = { createdAt: -1 }
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateMany(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>
  ): Promise<number> {
    const result = await this.model.updateMany(filter, data).exec();
    return result.modifiedCount;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount;
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).exec();
    return count > 0;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}

import { Model } from "mongoose";
import { IBaseRepository } from "src/core/repositories/base.repository";

export abstract class MongoBaseRepository<T> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: T): Promise<T> {
    const result = await this.model.create(data);
    return result.toObject() as T;
  }

  async findById(id: string): Promise<T | null> {
    return (await this.model.findById(id).lean()) as T | null;
  }

  async findAll(): Promise<T[]> {
    return (await this.model.find().lean()) as T[];
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return (await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .lean()) as T | null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}

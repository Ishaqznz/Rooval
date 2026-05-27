import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Availability } from "src/core/entities/doctor/availability/upsertAvailability.entity";
import { IAvailabilityRepository } from "src/core/repositories/availability.repository.interface";
import { DoctorAvailabilityDocument, DoctorAvailabilitySchema } from "../schemas/doctor/availability.schema";
import { Model } from "mongoose";
import mongoose from "mongoose";
import { GetAvailability } from "src/core/entities/doctor/availability/getAvailability.entity";
import { IMongoAvailabilityDocument } from "../interfaces/documents/mongo.availability.document";
import { AvailabilityMapper } from "../mapper/availability.mapper";
import { ExtendedAvailability } from "src/core/entities/doctor/availability/extendedAvailability.entity";

@Injectable()
export class MongoAvailabilityRepository implements IAvailabilityRepository {
  constructor(
    @InjectModel(DoctorAvailabilitySchema.name)
    private readonly _availabilityModel: Model<DoctorAvailabilityDocument>
  ) { }

  async upsert(entities: Availability[]): Promise<boolean> {
    console.log('userting availability input: ', entities)
    const doctorObjectId = new mongoose.Types.ObjectId(
      entities[0].doctorId.value
    );

    const incomingDays = entities.map(e => e.dayOfWeek.value);
    const operations = entities.map(entity => ({
      updateOne: {
        filter: {
          doctorId: doctorObjectId,
          dayOfWeek: entity.dayOfWeek.value,
        },
        update: {
          $set: {
            sessions: entity.sessions.value,
            slotDuration: entity.slotDuration.value,
            startDate: entity.startDate,
            endDate: entity.endDate ?? null,
            timezone: entity.timezone
          },
        },
        upsert: true,
      },
    }));

    await this._availabilityModel.bulkWrite(operations);

    await this._availabilityModel.deleteMany({
      doctorId: doctorObjectId,
      dayOfWeek: { $nin: incomingDays },
    });

    return true;
  }

  async delete(doctorId: string): Promise<boolean> {
    const del = await this._availabilityModel.deleteMany({ doctorId: new mongoose.Types.ObjectId(doctorId) })
    return del.deletedCount > 0;
  }

  async getByDay(entity: GetAvailability): Promise<Availability[]> {
    const availabilities = await this._availabilityModel.find({ 
      doctorId: new mongoose.Types.ObjectId(entity.doctorId.value), 
      dayOfWeek: entity.dayOfWeek.value 
    }).lean<IMongoAvailabilityDocument[]>();
    const entities = AvailabilityMapper.toAvailabilityEntities(availabilities)
    return entities;
  }

  async getByIds(doctorIds: string[]): Promise<ExtendedAvailability[]> {
    const objectIds = doctorIds.map((id) => new mongoose.Types.ObjectId(id))
    const availabilities = await this._availabilityModel.find({ 
      doctorId: { $in: objectIds }
    }).lean<IMongoAvailabilityDocument[]>();
     return AvailabilityMapper.toExtendedAvailabilityEntities(availabilities)
  }
}
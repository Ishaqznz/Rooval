import { Request, Response } from 'express';
import DataLoader from 'dataloader';
import { DoctorAvailability } from 'src/adapters/api/graphQL/types/availability/model/availability.model';
import { Appointment } from 'src/adapters/api/graphQL/types/appointment/model/appointment.model';
import { Doctor } from 'src/adapters/api/graphQL/types/doctor/model/doctor.model';
import { User } from 'src/adapters/api/graphQL/types/user/model/user.model';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export interface GqlContext {
  req: AuthenticatedRequest;
  res: Response;
  loaders: {
    availability: DataLoader<string, DoctorAvailability[]>;
    doctor: DataLoader<string, Doctor>;
    user: DataLoader<string, User>
    appointments: {
      byUserId: DataLoader<string, Appointment[]>;
      byDoctorId: DataLoader<string, Appointment[]>;
    };
  };
}

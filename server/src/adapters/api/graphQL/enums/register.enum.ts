import { registerEnumType } from "@nestjs/graphql";
import { ConsultationFilter, ConsultationType, DoctorSortField, DoctorSortOrder, DoctorStatusFilter, OrderBy } from "src/core/enums/doctor/doctor.enums";
import { Gender } from "src/core/enums/user/profile.enum";
import { DayOfWeek } from "src/core/enums/doctor/availability.enums";
import { DoctorSortBy } from "src/core/enums/doctor/doctor.enums";
import { AuthFilter, RoleFilter, SortField, SortOrder, StatusFilter } from "src/core/enums/user/user.enums";
import { AppointmentStatus, PaymentStatus } from "src/core/enums/appointments/appointment.enums";
import { AppointmentType } from "src/core/enums/user/profile.enum";
import { DoctorAppointmentType } from "src/core/enums/appointments/appointment.enums";
import { DoctorSpecialization } from "src/core/enums/doctor/profile.enums";
import { Audience, NotificationType } from "src/core/enums/notifications/notification.enum";
import { MessageStatus } from "src/core/interfaces/chat/chat.interfaces";
import { Role } from "src/core/enums/user/role.enum";
import { MessageType } from "src/core/enums/conversations/conversation.enum";
import { ListTransactionType, WalletTransactionReason, WalletTransactionType } from "src/core/enums/wallet/wallet.enum";

export function registerGraphQLEnums() {
  registerEnumType(ConsultationType, {
    name: "ConsultationType",
  });

  registerEnumType(Gender, {
    name: "Gender"
  })

  registerEnumType(DayOfWeek, {
    name: 'DayOfWeek'
  })

  registerEnumType(DoctorSortBy, {
    name: 'DoctorSortBy'
  })

  registerEnumType(OrderBy, {
    name: 'OrderBy'
  })

  registerEnumType(SortField, {
    name: 'SortField'
  })

  registerEnumType(SortOrder, {
    name: 'SortOrder'
  })


  registerEnumType(StatusFilter, {
    name: 'StatusFilter'
  })

  registerEnumType(RoleFilter, {
    name: 'RoleFilter'
  })

  registerEnumType(AuthFilter, {
    name: 'AuthFilter'
  })

  registerEnumType(DoctorStatusFilter, {
    name: 'DoctorStatusFilter'
  })

  registerEnumType(ConsultationFilter, {
    name: 'consultationFilter'
  })

  registerEnumType(DoctorSortField, {
    name: 'DoctorSortField'
  })

  registerEnumType(DoctorSortOrder, {
    name: 'DoctorSortOrder'
  })

  registerEnumType(AppointmentStatus, {
    name: 'AppointmentStatus'
  })

  registerEnumType(AppointmentType, {
    name: 'AppointmentType'
  })

  registerEnumType(DoctorAppointmentType, {
    name: 'DoctorAppointmentType'
  })

  registerEnumType(PaymentStatus, {
    name: 'PaymentStatus'
  })

  registerEnumType(DoctorSpecialization, {
    name: 'DoctorSpecialization'
  })

  registerEnumType(NotificationType, {
    name: 'NotificationType'
  })

  registerEnumType(MessageStatus, {
    name: 'MessageStatus'
  })

  registerEnumType(Role, {
    name: 'Role'
  })

  registerEnumType(MessageType, {
    name: 'MessageType'
  })

  registerEnumType(Audience, {
    name: 'Audience'
  })

  registerEnumType(WalletTransactionType, {
    name: "WalletTransactionType",
  })

  registerEnumType(WalletTransactionReason, {
    name: "WalletTransactionReason",
  })

  registerEnumType(ListTransactionType, {
    name: 'ListTransactionType'
  })
}



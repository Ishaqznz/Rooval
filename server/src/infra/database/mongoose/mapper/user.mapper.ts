import { User } from "src/core/entities/user/user.entity";
import { IMongoUserDocument } from "../interfaces/documents/mongo.user.document";
import { BusinessRuleViolationError } from "src/core/errors/businessRule.error";
import { UserErrorType } from "src/core/enums/user/user.enums";

export class UserMapper {
  static toUserEntity(user: IMongoUserDocument): User | string {
    const userEntity = User.create(user.fullName, user.email, user.password, user._id.toString(), 'user', user.isAdmin, user.isBlocked, user.profile)
    if (userEntity.ok == true) return userEntity.value
    return userEntity.error;
  }

  static toUserEntities(users: IMongoUserDocument[]): User[] {
    const userEntities = users.map((userDoc) => User.create(userDoc.fullName, userDoc.email, userDoc.password, userDoc._id.toString(), 'user', userDoc.isAdmin, userDoc.isBlocked, userDoc.profile))
    const mappedUserEntities = userEntities.map((userDoc) => {
      if (!userDoc.ok) throw new BusinessRuleViolationError(UserErrorType.ValidationFailed)
      return userDoc.value
    })
    return mappedUserEntities
  }
}
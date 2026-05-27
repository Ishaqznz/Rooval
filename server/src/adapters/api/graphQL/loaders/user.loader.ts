import DataLoader = require('dataloader');
import { User } from '../types/user/model/user.model';
import { Injectable, Inject } from "@nestjs/common";
import { IUserUseCase } from 'src/application/use-cases/interface/user.usecase.interface';

@Injectable()
export class UserLoader {
    constructor(
        @Inject('IUserUseCase')
        private readonly _userUseCase: IUserUseCase
    ) { }

    create() {
        return new DataLoader<string, User>(async (userIds: readonly string[]) => {
            const users = await this._userUseCase.findByIds(userIds as string[]);

            const userMap = new Map<string, User>();
            for (const user of users) {
                userMap.set(user.id.toString(), user);
            }

            const userData = userIds.map((id) => {
                const user = userMap.get(id.toString());
                return user || null;
            });
            
            return userData;
        });
    }
}
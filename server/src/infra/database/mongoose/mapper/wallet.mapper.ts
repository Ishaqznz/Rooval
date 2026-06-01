import { Wallet } from "src/core/entities/wallet/wallet.entity";
import { Transaction } from "src/core/entities/wallet/transaction.entity";
import { IMongoWalletDocument } from "../interfaces/documents/mongo.wallet.document";
import { IMongoTransactionDocument } from "../interfaces/documents/mongo.transaction.document";
import { Role } from "src/core/enums/user/role.enum";

export class WalletMapper {

    static toWalletEntity(
        input: IMongoWalletDocument
    ): Wallet {
        return Wallet.create({
            id: input._id.toString(),
            ownerId: input.ownerId.toString(),
            ownerType: input.ownerType as Role,
            balance: input.balance,
            currency: input.currency,
            isActive: input.isActive
        });
    }

    static toWalletEntities(
        input: IMongoWalletDocument[]
    ): Wallet[] {
        const entities: Wallet[] = [];

        for (const item of input) {
            entities.push(
                this.toWalletEntity(item)
            );
        }

        return entities;
    }

    static toTransactionEntity(
        input: IMongoTransactionDocument
    ): Transaction {
        return Transaction.create({
            id: input._id.toString(),
            walletId: input.walletId.toString(),
            type: input.type,
            amount: input.amount,
            reason: input.reason,
            createdAt: input.createdAt
        });
    }

    static toTransactionEntities(
        input: IMongoTransactionDocument[]
    ): Transaction[] {
        const entities: Transaction[] = [];

        for (const item of input) {
            entities.push(
                this.toTransactionEntity(item)
            );
        }

        return entities;
    }
}
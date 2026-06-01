import { ITransactionResponseDTO } from "src/application/dto/wallet/response/transaction.response.dto";
import { Transaction } from "src/core/entities/wallet/transaction.entity";

export class TransactionOutputMapper {
    static toDto(entity: Transaction): ITransactionResponseDTO {
        return {
            id: entity.input.id,
            walletId: entity.input.walletId,
            amount: entity.input.amount,
            createdAt: entity.input.createdAt,
            reason: entity.input.reason,
            type: entity.input.type
        }
    }

    static toDtos(entities: Transaction[]): ITransactionResponseDTO[] {
        const dtos = entities.map((entity: Transaction) => ({
            id: entity.input.id,
            walletId: entity.input.walletId,
            amount: entity.input.amount,
            createdAt: entity.input.createdAt,
            reason: entity.input.reason,
            type: entity.input.type
        }))

        return dtos
    }
}
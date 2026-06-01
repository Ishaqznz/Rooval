import { IWalletResponseDTO } from "src/application/dto/wallet/response/wallet.response.dto";
import { Wallet } from "src/core/entities/wallet/wallet.entity";

export class WalletOutputMapper {
    static toDto(entity: Wallet): IWalletResponseDTO {
        return {
            id: entity.input.id,
            ownerId: entity.input.ownerId,
            ownerType: entity.input.ownerType,
            balance: entity.input.balance,
            currency: entity.input.currency,
            isActive: entity.input.isActive
        }
    }

    static toDtos(entities: Wallet[]): IWalletResponseDTO[] {
        const dtos = entities.map((entity) => ({
            id: entity.input.id,
            ownerId: entity.input.ownerId,
            ownerType: entity.input.ownerType,
            balance: entity.input.balance,
            currency: entity.input.currency,
            isActive: entity.input.isActive
        }))

        return dtos
    }
}
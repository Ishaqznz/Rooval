import { IConversationResponseDTO } from "src/application/dto/conversation/response/conversation.response.dto";
import { Conversation } from "src/core/entities/conversation/conversation.entity";

export class ConversationOutputMapper {
    static toConversationDtos(entities: Conversation[]): IConversationResponseDTO[] {
        const dtos: IConversationResponseDTO[] = entities.map((e) => {
            return {
                id: e.input.id,
                participants: e.input.participants,
                lastMessage: e.input.lastMessage,
                lastMessageType: e.input.lastMessageType,
                lastMessageAt: e.input.lastMessageAt,
                createdAt: e.input.createdAt,
                updatedAt: e.input.updatedAt
            }
        })

        return dtos;
    }

    static toConversationDto(entity: Conversation): IConversationResponseDTO {
        const dto: IConversationResponseDTO = {
            id: entity.input.id,
            participants: entity.input.participants,
            lastMessage: entity.input.lastMessage,
            lastMessageAt: entity.input.lastMessageAt,
            lastMessageType: entity.input.lastMessageType,
            createdAt: entity.input.createdAt,
            updatedAt: entity.input.updatedAt
        }

        return dto
    }
}
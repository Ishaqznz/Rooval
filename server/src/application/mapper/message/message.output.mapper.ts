import { IMessageResponseDTO } from "src/application/dto/message/response/message.response.dto";
import { ExtendedMessage } from "src/core/entities/message/extendedMessage.entity";

export class MessageOutputMapper {
    static toMessageDto(entity: ExtendedMessage): IMessageResponseDTO {
        return {
            id: entity.input.id,
            conversationId: entity.input.conversationId,
            content: entity.input.content,
            sender: entity.input.sender,
            createdAt: entity.input.createdAt,
            status: entity.input.status,
            type: entity.input.type,
            updatedAt: entity.input.updatedAt,
            fileName: entity.input.fileName,
            fileUrl: entity.input.fileUrl,
            mimeType: entity.input.mimeType
        }
    }

    static toMessageDtos(entities: ExtendedMessage[]): IMessageResponseDTO[] {
        const result = entities.map((entity) => ({
            id: entity.input.id,
            conversationId: entity.input.conversationId,
            content: entity.input.content,
            sender: entity.input.sender,
            createdAt: entity.input.createdAt,
            status: entity.input.status,
            type: entity.input.type,
            updatedAt: entity.input.updatedAt,
            fileName: entity.input.fileName,
            fileUrl: entity.input.fileUrl,
            mimeType: entity.input.mimeType
        }))

        return result
    }
}
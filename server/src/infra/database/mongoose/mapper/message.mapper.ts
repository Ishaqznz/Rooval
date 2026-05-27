import { ExtendedMessage } from "src/core/entities/message/extendedMessage.entity";
import { IMongoMessageDocument } from "../interfaces/documents/mongo.message.document";

export class MessageMapper {
    static toMessageEntity(input: IMongoMessageDocument): ExtendedMessage {
        const entity = ExtendedMessage.create({
            id: input._id.toString(),
            conversationId: input.conversationId.toString(),
            sender: {
                userId: input.senderId, role: input.senderRole
            },
            content: input.content,
            type: input.type,
            status: input.status,
            fileName: input.fileName,
            fileUrl: input.fileUrl,
            createdAt: input.createdAt,
            updatedAt: input.updatedAt
        })

        return entity
    }

    static toMessageEntities(input: IMongoMessageDocument[]): ExtendedMessage[] {
        const entities: ExtendedMessage[] = input.map((doc) => {
            return ExtendedMessage.create({
                id: doc._id.toString(),
                conversationId: doc.conversationId.toString(),
                sender: {
                    userId: doc.senderId, role: doc.senderRole,
                },
                content: doc.content,
                type: doc.type,
                status: doc.status,
                fileName: doc.fileName,
                fileUrl: doc.fileUrl,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            })
        })

        return entities;
    }
}
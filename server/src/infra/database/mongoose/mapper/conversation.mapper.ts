import { Conversation } from "src/core/entities/conversation/conversation.entity";
import { IMongoConversationDocument } from "../interfaces/documents/mongo.conversation.document";

export class ConversationMapper {
    static toEntity(doc: IMongoConversationDocument): Conversation {
        return Conversation.create({
            id: doc._id.toString(),
            participants: doc.participants.map((val) => ({ userId: val.userId.toString(), role: val.role })),
            lastMessage: doc.lastMessage,
            lastMessageType: doc.lastMessageType,
            lastMessageAt: doc.lastMessageAt,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        })
    }

    static toEntities(docs: IMongoConversationDocument[]): Conversation[] {
        const result = docs.map((doc) => {
            return Conversation.create({
                id: doc._id.toString(),
                participants: doc.participants.map((val) => ({ userId: val.userId.toString(), role: val.role })),
                lastMessage: doc.lastMessage,
                lastMessageType: doc.lastMessageType,
                lastMessageAt: doc.lastMessageAt,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            })
        })

        return result;
    }
} 
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ExtendedMessage } from "src/core/entities/message/extendedMessage.entity";
import { SendMessage } from "src/core/entities/message/sendMessage.entity";
import { IMessageRepository } from "src/core/repositories/message.repository.interface";
import { MessageDocument, MongoMessageSchema } from "../schemas/messages/message.schema";
import mongoose, { Model } from "mongoose";
import { IMongoMessageDocument } from "../interfaces/documents/mongo.message.document";
import { MessageMapper } from "../mapper/message.mapper";
import { GetMessage } from "src/core/entities/message/getMessage.entity";
import { MarkAsRead } from "src/core/entities/message/markAsRead.entity";
import { CreateMessagePayload } from "../interfaces/types/message.payload.type";

@Injectable()
export class MessageRepository implements IMessageRepository {
    constructor(
        @InjectModel(MongoMessageSchema.name)
        private readonly _messageModel: Model<MessageDocument>
    ) { }

    async sendMessage(entity: SendMessage): Promise<ExtendedMessage> {
        const messagePayload: CreateMessagePayload = {
            conversationId: new mongoose.Types.ObjectId(entity.input.conversationId),
            senderId: new mongoose.Types.ObjectId(entity.input.senderId),
            content: entity.input.content,
            status: entity.input.status,
            type: entity.input.type,
        };

        if (entity.input?.fileUrl) {
            messagePayload.fileUrl = entity.input.fileUrl;
        }

        if (entity.input?.fileName) {
            messagePayload.fileName = entity.input.fileName;
        }

        if (entity.input?.mimeType) {
            messagePayload.mimeType = entity.input.mimeType
        }

        console.log('the final message payload in the repo: ', messagePayload, "entity: ", entity)

        const messageDoc = (await this._messageModel.create(messagePayload)).toObject() as unknown as IMongoMessageDocument;
        return MessageMapper.toMessageEntity(messageDoc)
    }

    async getMessage(entity: GetMessage): Promise<ExtendedMessage[]> {
        const messages = await this._messageModel.find({ conversationId: new mongoose.Types.ObjectId(entity.input.conversationId) })
            .sort({ createdAt: 1 })
            .lean<IMongoMessageDocument[]>();
        return MessageMapper.toMessageEntities(messages)
    }

    async markAsRead(entity: MarkAsRead): Promise<boolean> {
        const update = await this._messageModel.updateOne(
            {
                conversationId: entity.input.conversationId,
                senderId: entity.input.userId
            }, {
            $set: {
                status: 'read'
            }
        })

        return update.modifiedCount> 0;
    }
}
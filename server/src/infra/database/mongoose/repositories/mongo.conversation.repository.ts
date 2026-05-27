import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Conversation } from "src/core/entities/conversation/conversation.entity";
import { IConversationRepository } from "src/core/repositories/conversation.repository.interface";
import { ConversationDocument, MongoConversationSchema } from "../schemas/conversation/conversation.shema";
import mongoose, { Model } from "mongoose";
import { IMongoConversationDocument } from "../interfaces/documents/mongo.conversation.document";
import { ConversationMapper } from "../mapper/conversation.mapper";
import { UpdateLastMessage } from "src/core/entities/conversation/updateLastMessage.entity";
import { CreateConversation } from "src/core/entities/conversation/createConversation.entity";

@Injectable()
export class ConversationRepository implements IConversationRepository {
    constructor(
        @InjectModel(MongoConversationSchema.name)
        private readonly _conversationModel: Model<ConversationDocument>
    ) { }

    async getConversationById(conversationId: string): Promise<Conversation> {
        const conversation = await this._conversationModel.findById(new mongoose.Types.ObjectId(conversationId))
            .lean<IMongoConversationDocument>();
        return ConversationMapper.toEntity(conversation)
    }

    async getUserConversations(userId: string): Promise<Conversation[]> {
        const conversations = await this._conversationModel.find({
            "participants.userId": new mongoose.Types.ObjectId(userId)
        }).sort({ createdAt: -1 })
            .lean<IMongoConversationDocument[]>();
        return ConversationMapper.toEntities(conversations)
    }

    async getConversation(userIds: string[]): Promise<Conversation | null> {
        const objectIds = userIds.map(
            (id) => new mongoose.Types.ObjectId(id)
        );

        const doc = await this._conversationModel.findOne({
            "participants.userId": {
                $all: objectIds
            }
        }).lean<IMongoConversationDocument>();
        if (!doc) return null

        return ConversationMapper.toEntity(doc)
    }

    async createConversation(
        entity: CreateConversation
    ): Promise<Conversation> {
        const doc = await this._conversationModel.create(entity.input);
        const mongoDoc = doc.toObject() as unknown as IMongoConversationDocument
        return ConversationMapper.toEntity(mongoDoc);
    }

    async updateLastMessage(entity: UpdateLastMessage): Promise<boolean> {
        const update = await this._conversationModel.updateOne({
            _id: new mongoose.Types.ObjectId(entity.input.conversationId)
        }, {
            $set: {
                lastMessage: entity.input.lastMessage,
                lastMessageType: entity.input.lastMessageType,
                lastMessageAt: new Date()
            }
        })

        return update.modifiedCount > 0
    }
}
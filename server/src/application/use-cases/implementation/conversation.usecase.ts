import { IConversationResponseDTO } from "src/application/dto/conversation/response/conversation.response.dto";
import { IConversationUseCase } from "../interface/conversation.usecase.interface";
import { Inject } from "@nestjs/common";
import { IConversationRepository } from "src/core/repositories/conversation.repository.interface";
import { ConversationOutputMapper } from "src/application/mapper/conversation/conversation.output.mapper";
import { IUpdateLastMessageRequestDTO } from "src/application/dto/conversation/request/updateLastMessage.request.dto";
import { UpdateLastMessage } from "src/core/entities/conversation/updateLastMessage.entity";
import { CreateConversation } from "src/core/entities/conversation/createConversation.entity";
import { ICreateConversationRequestDTO } from "src/application/dto/conversation/request/createConversation.request.dto";
import { IUserUseCase } from "../interface/user.usecase.interface";

export class ConversationUseCase implements IConversationUseCase {
    constructor(
        @Inject('IUserUseCase')
        private readonly _userUseCase: IUserUseCase,
        @Inject('IConversationRepository')
        private readonly _conversationRepository: IConversationRepository
    ) { }

    async getConversations(userIds: string[]): Promise<IConversationResponseDTO> {
        const entity = await this._conversationRepository.getConversation(
            userIds
        )
        if (!entity) return null
        return ConversationOutputMapper.toConversationDto(entity)
    }

    async createConversation(
        input: ICreateConversationRequestDTO
    ): Promise<IConversationResponseDTO> {
        const participantsWithRole = await Promise.all(
            input.participants.map(async (participant) => {
                const role = await this._userUseCase.findByRole(
                    participant.userId
                );

                return {
                    userId: participant.userId,
                    role
                };
            })
        );

        const entity = CreateConversation.create({
            participants: participantsWithRole,
            lastMessage: input.lastMessage,
            lastMessageType: input.lastMessageType,
            lastMessageAt: input.lastMessageAt
        });

        const convEntity =
            await this._conversationRepository.createConversation(entity);

        return ConversationOutputMapper.toConversationDto(convEntity);
    }

    async getUserConversations(userId: string): Promise<IConversationResponseDTO[]> {
        const entities = await this._conversationRepository.getUserConversations(userId)
        return ConversationOutputMapper.toConversationDtos(entities)
    }

    async getConversationsById(conversationId: string): Promise<IConversationResponseDTO> {
        const entity = await this._conversationRepository.getConversationById(conversationId)
        return ConversationOutputMapper.toConversationDto(entity)
    }

    async updateLastMessage(input: IUpdateLastMessageRequestDTO): Promise<boolean> {
        const entity = UpdateLastMessage.create(input)
        return await this._conversationRepository.updateLastMessage(entity)
    }
}
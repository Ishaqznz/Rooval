import { ISendMessageRequestDTO } from "src/application/dto/message/request/sendMessage.request.dto";
import { IMessageResponseDTO } from "src/application/dto/message/response/message.response.dto";
import { IMessageUseCase } from "../interface/message.usecase.interface";
import { Inject, Injectable } from "@nestjs/common";
import { IMessageRepository } from "src/core/repositories/message.repository.interface";
import { IGetMessageRequestDTO } from "src/application/dto/message/request/getMessage.request.dto";
import { IMarkAsReadRequestDTO } from "src/application/dto/message/request/markAsRead.request.dto";
import { GetMessage } from "src/core/entities/message/getMessage.entity";
import { IConversationUseCase } from "../interface/conversation.usecase.interface";
import { MessageInputMapper } from "src/application/mapper/message/message.input.mapper";
import { MessageOutputMapper } from "src/application/mapper/message/message.output.mapper";
import { MarkAsRead } from "src/core/entities/message/markAsRead.entity";
import { MessageType } from "src/core/enums/conversations/conversation.enum";
import { ICloudinaryService } from "src/application/services/cloudinary.service.interface";
import { BusinessRuleViolationError } from "src/core/errors/businessRule.error";
import { UserErrorType } from "src/core/enums/user/user.enums";
import { IFileUploadRequestDTO } from "src/application/dto/message/request/fileUpload.request.dto";
import { ISupaBaseService } from "src/application/services/supabase.service.interface";

@Injectable()
export class MessageUseCase implements IMessageUseCase {
    constructor(
        @Inject('IMessageRepository')
        private readonly _messageRepository: IMessageRepository,

        @Inject('IConversationUseCase')
        private readonly _conversationUseCase: IConversationUseCase,

        @Inject('ICloudinaryService')
        private readonly _cloudinaryService: ICloudinaryService,

        @Inject('ISupabaseService')
        private readonly _supabaseService: ISupaBaseService
    ) { }

    async sendMessage(input: ISendMessageRequestDTO): Promise<IMessageResponseDTO> {
        let conversation = await this._conversationUseCase.getConversations([input.senderId, input.receiverId])
        if (conversation) {
            await this._conversationUseCase.updateLastMessage({
                conversationId: conversation.id,
                lastMessage: input.content,
                lastMessageAt: new Date(),
                lastMessageType: input.type
            })
        }

        if (!conversation) {
            conversation = await this._conversationUseCase.createConversation({
                participants: [
                    { userId: input.senderId },
                    { userId: input.receiverId }
                ],
                lastMessage: input.content,
                lastMessageAt: new Date(),
                lastMessageType: input.type
            })
        }

        let cloudinaryUrl: string
        if (input.type === MessageType.IMAGE) {
            cloudinaryUrl = await this._cloudinaryService.uploadBaseFile(input.fileUrl, 'messages')
            if (!cloudinaryUrl) throw new BusinessRuleViolationError(UserErrorType.INVALID_FILE)
        }

        return MessageOutputMapper.toMessageDto(
            await this._messageRepository.sendMessage(
                MessageInputMapper.toSendMessagEntity(
                    {
                        ...input,
                        fileUrl: cloudinaryUrl || input.fileUrl,
                        mimeType: input?.mimeType
                    },
                    conversation.id
                )
            )
        )
    }

    async getMessage(input: IGetMessageRequestDTO): Promise<IMessageResponseDTO[]> {
        const entity = GetMessage.create(input)
        const result = MessageOutputMapper.toMessageDtos(await this._messageRepository.getMessage(entity))
        return result
    }

    async markAsRead(input: IMarkAsReadRequestDTO): Promise<boolean> {
        return await this._messageRepository.markAsRead(MarkAsRead.create(input))
    }

    async fileUpload(input: IFileUploadRequestDTO): Promise<string> {
        const file = await input.file;
        const isImage = file.mimetype.startsWith('image/');
        let cloudinaryUrl: string;

        if (isImage) {
            cloudinaryUrl = await this._cloudinaryService.uploadFile(
                file,
                'messages/images'
            );
        } else {
            cloudinaryUrl = await this._supabaseService.uploadRawFile(
                file,
                'messages/documents'
            );
        }

        return cloudinaryUrl;
    }
}
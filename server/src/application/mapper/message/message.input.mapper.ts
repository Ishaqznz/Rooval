import { ISendMessageRequestDTO } from "src/application/dto/message/request/sendMessage.request.dto";
import { SendMessage } from "src/core/entities/message/sendMessage.entity";

export class MessageInputMapper {
    static toSendMessagEntity(input: ISendMessageRequestDTO, conversationId: string): SendMessage {
        console.log('the input in the mapper: ', input)
        return SendMessage.create({
            conversationId,
            senderId: input.senderId,
            receiverId: input.receiverId, 
            content: input.content,
            status: input.status,
            fileName: input.fileName,
            type: input.type,
            fileUrl: input.fileUrl,
            mimeType: input.mimeType
        })
    }
}
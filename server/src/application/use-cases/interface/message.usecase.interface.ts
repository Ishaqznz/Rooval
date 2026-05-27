import { IFileUploadRequestDTO } from "src/application/dto/message/request/fileUpload.request.dto";
import { IGetMessageRequestDTO } from "src/application/dto/message/request/getMessage.request.dto";
import { IMarkAsReadRequestDTO } from "src/application/dto/message/request/markAsRead.request.dto";
import { ISendMessageRequestDTO } from "src/application/dto/message/request/sendMessage.request.dto";
import { IMessageResponseDTO } from "src/application/dto/message/response/message.response.dto";

export interface IMessageUseCase {
    sendMessage(input: ISendMessageRequestDTO): Promise<IMessageResponseDTO> 
    getMessage(input: IGetMessageRequestDTO): Promise<IMessageResponseDTO[]> 
    markAsRead(input: IMarkAsReadRequestDTO): Promise<boolean>
    fileUpload(input: IFileUploadRequestDTO): Promise<string>
}
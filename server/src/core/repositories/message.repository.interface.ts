import { ExtendedMessage } from "../entities/message/extendedMessage.entity";
import { GetMessage } from "../entities/message/getMessage.entity";
import { MarkAsRead } from "../entities/message/markAsRead.entity";
import { SendMessage } from "../entities/message/sendMessage.entity";

export interface IMessageRepository {
    sendMessage(entity: SendMessage): Promise<ExtendedMessage>
    getMessage(entity: GetMessage): Promise<ExtendedMessage[]>
    markAsRead(entity: MarkAsRead): Promise<boolean>
}
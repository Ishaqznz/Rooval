import { IAddMoneyRequestDTO } from "../../dto/wallet/request/addMoney.request.dto";
import { IDeductMoneyRequestDTO } from "../../dto/wallet/request/deductMoney.request.dto";
import { IGetWalletRequestDTO } from "../../dto/wallet/request/getWallet.request.dto";
import { IGetTransactionsRequestDTO } from "../../dto/wallet/request/getTransactions.request.dto";
import { IWalletResponseDTO } from "../../dto/wallet/response/wallet.response.dto";
import { ITransactionResponseDTO } from "../../dto/wallet/response/transaction.response.dto";
import { ICreateWalletRequestDTO } from "../../dto/wallet/request/createWallet.request.dto";
import { ICreateTransactionRequestDTO } from "../../dto/wallet/request/createTransaction.request.dto";
import { IGetBalanceRequestDTO } from "../../dto/wallet/request/getBalance.request.dto";
import { IListTransactionsResponseDTO } from "../../dto/wallet/response/listTransactions.response.dto";

export interface IWalletUseCase {
    createWallet(input: ICreateWalletRequestDTO): Promise<IWalletResponseDTO>
    createTransaction(input: ICreateTransactionRequestDTO): Promise<ITransactionResponseDTO>
    addMoney(input: IAddMoneyRequestDTO): Promise<boolean>;
    deductMoney(input: IDeductMoneyRequestDTO): Promise<boolean>;
    getWallet(input: IGetWalletRequestDTO): Promise<IWalletResponseDTO>;
    getBalance(input: IGetBalanceRequestDTO): Promise<number>;
    listTransactions(input: IGetTransactionsRequestDTO): Promise<IListTransactionsResponseDTO>
    findAllWallets(): Promise<IWalletResponseDTO[]>
    findAllTransactions(): Promise<ITransactionResponseDTO[]>
}
import { IAddMoneyRequestDTO } from "src/application/dto/wallet/request/addMoney.request.dto";
import { IDeductMoneyRequestDTO } from "src/application/dto/wallet/request/deductMoney.request.dto";
import { IGetWalletRequestDTO } from "src/application/dto/wallet/request/getWallet.request.dto";
import { IGetTransactionsRequestDTO } from "src/application/dto/wallet/request/getTransactions.request.dto";
import { IWalletResponseDTO } from "src/application/dto/wallet/response/wallet.response.dto";
import { ITransactionResponseDTO } from "src/application/dto/wallet/response/transaction.response.dto";
import { ICreateWalletRequestDTO } from "src/application/dto/wallet/request/createWallet.request.dto";
import { ICreateTransactionRequestDTO } from "src/application/dto/wallet/request/createTransaction.request.dto";
import { IGetBalanceRequestDTO } from "src/application/dto/wallet/request/getBalance.request.dto";
import { IListTransactionsResponseDTO } from "src/application/dto/wallet/response/listTransactions.response.dto";

export interface IWalletUseCase {
    createWallet(input: ICreateWalletRequestDTO): Promise<IWalletResponseDTO>
    createTransaction(input: ICreateTransactionRequestDTO): Promise<ITransactionResponseDTO>
    addMoney(input: IAddMoneyRequestDTO): Promise<boolean>;
    deductMoney(input: IDeductMoneyRequestDTO): Promise<boolean>;
    getWallet(input: IGetWalletRequestDTO): Promise<IWalletResponseDTO>;
    getBalance(input: IGetBalanceRequestDTO): Promise<number>;
    listTransactions(input: IGetTransactionsRequestDTO): Promise<IListTransactionsResponseDTO>
}
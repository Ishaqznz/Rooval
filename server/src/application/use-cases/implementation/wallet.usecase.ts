import { ICreateWalletRequestDTO } from "../../dto/wallet/request/createWallet.request.dto";
import { IWalletUseCase } from "../interface/wallet.usecase.interface";
import { CreateWallet } from "../../../core/entities/wallet/createWallet.entity";
import { Inject } from "@nestjs/common";
import { IWalletRepository } from "../../../core/repositories/wallet.repository.inteface";
import { ICreateTransactionRequestDTO } from "../../dto/wallet/request/createTransaction.request.dto";
import { IWalletResponseDTO } from "../../dto/wallet/response/wallet.response.dto";
import { CreateTransaction } from "../../../core/entities/wallet/createTransaction.entity";
import { WalletOutputMapper } from "../../mapper/wallet/wallet.output.mapper";
import { ITransactionResponseDTO } from "../../dto/wallet/response/transaction.response.dto";
import { TransactionOutputMapper } from "../../mapper/wallet/transaction.output.mapper";
import { IAddMoneyRequestDTO } from "../../dto/wallet/request/addMoney.request.dto";
import { AddMoney } from "../../../core/entities/wallet/addMoney.entity";
import { IDeductMoneyRequestDTO } from "../../dto/wallet/request/deductMoney.request.dto";
import { DeductMoney } from "../../../core/entities/wallet/deductMoney.entity";
import { IGetWalletRequestDTO } from "../../dto/wallet/request/getWallet.request.dto";
import { GetBalance } from "../../../core/entities/wallet/getBalance.entity";
import { IGetTransactionsRequestDTO } from "../../dto/wallet/request/getTransactions.request.dto";
import { GetTransactions } from "../../../core/entities/wallet/getTransactions.entity";
import { IGetBalanceRequestDTO } from "../../dto/wallet/request/getBalance.request.dto";
import { GetWallet } from "../../../core/entities/wallet/getWallet.entity";
import { BusinessRuleViolationError } from "../../../core/errors/businessRule.error";
import { WalletErrorType } from "../../../core/enums/wallet/wallet.enum";
import { IListTransactionsResponseDTO } from "../../dto/wallet/response/listTransactions.response.dto";

export class WalletUseCase implements IWalletUseCase {
    constructor(
        @Inject('IWalletRepository')
        private readonly _walletRepository: IWalletRepository
    ) {}

    async createWallet(input: ICreateWalletRequestDTO): Promise<IWalletResponseDTO> {
        const entity = CreateWallet.create(input)
        const walletEntity = await this._walletRepository.createWallet(entity)
        return WalletOutputMapper.toDto(walletEntity)
    }

    async createTransaction(input: ICreateTransactionRequestDTO): Promise<ITransactionResponseDTO> {
        const entity = CreateTransaction.create(input)
        const transactionEntity = await this._walletRepository.createTransaction(entity)
        return TransactionOutputMapper.toDto(transactionEntity)
    }

    async addMoney(input: IAddMoneyRequestDTO): Promise<boolean> {
        const entity = AddMoney.create(input)
        return await this._walletRepository.addMoney(entity)
    }

    async deductMoney(input: IDeductMoneyRequestDTO): Promise<boolean> {
        const entity = DeductMoney.create(input)
        return await this._walletRepository.deductMoney(entity)
    }

    async getBalance(input: IGetBalanceRequestDTO): Promise<number> {
        const entity = GetBalance.create(input)
        return await this._walletRepository.getBalance(entity)
    }

    async listTransactions(input: IGetTransactionsRequestDTO): Promise<IListTransactionsResponseDTO> {
        const entity = GetTransactions.create(input)
        const transaction = await this._walletRepository.listTransactions(entity)
        const dto = TransactionOutputMapper.toDtos(transaction.input.transactions)
        return { transactions: dto, totalTransactions: transaction.input.totalTransactions }
    }

    async getWallet(input: IGetWalletRequestDTO): Promise<IWalletResponseDTO> {
        const entity = GetWallet.create(input)
        const wallet = await this._walletRepository.getWallet(entity)
        if (!wallet) throw new BusinessRuleViolationError(WalletErrorType.WALLET_NOT_FOUND)
        return WalletOutputMapper.toDto(wallet)
    }

    async findAllWallets(): Promise<IWalletResponseDTO[]> {
        const entities = await this._walletRepository.findAllWallets()
        return WalletOutputMapper.toDtos(entities)
    }

    async findAllTransactions(): Promise<ITransactionResponseDTO[]> {
        const entities = await this._walletRepository.findAllTransactions()
        return TransactionOutputMapper.toDtos(entities)
    }
}
import { AddMoney } from "../entities/wallet/addMoney.entity";
import { CreateTransaction } from "../entities/wallet/createTransaction.entity";
import { CreateWallet } from "../entities/wallet/createWallet.entity";
import { DeductMoney } from "../entities/wallet/deductMoney.entity";
import { GetBalance } from "../entities/wallet/getBalance.entity";
import { GetTransactions } from "../entities/wallet/getTransactions.entity";
import { GetWallet } from "../entities/wallet/getWallet.entity";
import { ListTransactions } from "../entities/wallet/listTransactions.entity";
import { Transaction } from "../entities/wallet/transaction.entity";
import { Wallet } from "../entities/wallet/wallet.entity";

export interface IWalletRepository {
    createWallet(entity: CreateWallet): Promise<Wallet>
    createTransaction(entity: CreateTransaction): Promise<Transaction>
    addMoney(entity: AddMoney): Promise<boolean>
    deductMoney(entity: DeductMoney): Promise<boolean>
    getBalance(entity: GetBalance): Promise<number>
    listTransactions(entity: GetTransactions): Promise<ListTransactions>
    getWallet(entity: GetWallet): Promise<Wallet>
    findAllWallets(): Promise<Wallet[]>
    findAllTransactions(): Promise<Transaction[]>
}
export const sendFlowCadence = (FlowTokenAddress: string, FungibleTokenAddress: string) => {
  return `
    import FungibleToken from ${FungibleTokenAddress}
    import FlowToken from ${FlowTokenAddress}

    transaction(amount: UFix64, to: Address) {

    let sentVault: @{FungibleToken.Vault}

    prepare(signer: auth(BorrowValue) &Account) {

        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")

        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        let receiverRef =  getAccount(to)
            .capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
			?? panic("Could not borrow receiver reference to the recipient's Vault")

        receiverRef.deposit(from: <-self.sentVault)
    }
}
  `
}


export const getBalanceCadence = (FlowStorageFeesAddress: string, FlowServiceAccountAddress: string) => {
  return `
    import FlowStorageFees from ${FlowStorageFeesAddress}
    import FlowServiceAccount from ${FlowServiceAccountAddress}

    access(all) struct StorageInfo {
        access(all) let storageUsed: UInt64
        access(all) let storageCapacity: UInt64
        access(all) let minimumStorageReservation: UFix64
        access(all) let storageMegaBytesPerReservedFLOW: UFix64
        access(all) let useableAccountBalance: UFix64

        init(address: Address) {
            let acct = getAccount(address)

            self.storageUsed = acct.storage.used
            self.storageCapacity = acct.storage.capacity

            self.minimumStorageReservation = FlowStorageFees.minimumStorageReservation
            self.storageMegaBytesPerReservedFLOW = FlowStorageFees.storageMegaBytesPerReservedFLOW

            let balance = FlowServiceAccount.defaultTokenBalance(acct)
            var reserved = UFix64(self.storageUsed) / UFix64(1000000) / FlowStorageFees.storageMegaBytesPerReservedFLOW
            if reserved < FlowStorageFees.minimumStorageReservation {
                reserved = FlowStorageFees.minimumStorageReservation
            }
            if balance < reserved {
                self.useableAccountBalance = UFix64(0)
            } else {
                self.useableAccountBalance = balance - reserved
            }
        }
    }

    access(all) fun main(address: Address): StorageInfo {
        return StorageInfo(address: address)
    }
  `
}

export const getUsdcBalanceCadence = (FungibleToken: string, USDCFlow: string) => {
  return `
    import FungibleToken from ${FungibleToken}
    import USDCFlow from ${USDCFlow}

    access(all) fun main(address: Address): UFix64 {
        let account = getAccount(address)
        let vaultRef = account.capabilities.get<&USDCFlow.Vault>(USDCFlow.VaultPublicPath)
            .borrow()
            ?? panic("Could not borrow Balance reference to the Vault")

        return vaultRef.balance
    }
  `
}
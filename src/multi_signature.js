const { AccountCreateTransaction, Hbar, Client, PrivateKey, KeyList, TransferTransaction } = require("@hashgraph/sdk")

// Acount 1
const account1 = PrivateKey.fromString("302e020100300506032b657004220420f39794519c55d5f05d45d8933eaef7dabf494b6b8466af12862bd7c5ce50e7b7")
const account1Id = "0.0.4567941"

// Acount 2
const account2 = PrivateKey.fromString("302e020100300506032b657004220420f1d5e07759450c9550f69a4ac662f95e5cd972a4648ebd29c95c073904a99de4")

// Acount 3
const account3 = PrivateKey.fromString("302e020100300506032b6570042204203e91ca4b65b5c2d1fcf4705bb7cff98bc2d5f528e2e311192b8f259f1c529ec2")

// Acount 4
const account4Id = "0.0.4567945"

const client = Client.forTestnet();
client.setOperator(account1Id, account1);

const publicKeys = [
    account1.publicKey,
    account2.publicKey,
    account3.publicKey
]

const newKey = new KeyList(publicKeys, 2)

async function createWallet(){
    let tx = await new AccountCreateTransaction()
        .setKey(newKey)
        .setInitialBalance(new Hbar(20))
        .execute(client);

    return (await tx.getReceipt(client)).accountId

}

async function spendFail(accId){
    const tx = await new TransferTransaction()
        .addHbarTransfer(accId, new Hbar(-10))
        .addHbarTransfer(account4Id, new Hbar(10))
        .freezeWith(client)
        .sign(account1);

    const executed =await (await tx.execute(client)).getReceipt(client);
    return executed
}

async function spend(accId){
    const tx = await (await new TransferTransaction()
        .addHbarTransfer(accId, new Hbar(-10))
        .addHbarTransfer(account4Id, new Hbar(10))
        .freezeWith(client)
        .sign(account1)).sign(account2);

    const executed =await (await tx.execute(client)).getReceipt(client);
    return executed
}

async function main(){
    const accountId = await createWallet();
    console.log(accountId)
    await spendFail(accountId).catch((err) => console.error(`Error: ${err}`))
    const tx = await spend(accountId);
    console.log(tx)
    process.exit()
}


main()
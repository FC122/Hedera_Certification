const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    ScheduleDeleteTransaction,
    ScheduleSignTransaction,
    PrivateKey,
    Hbar
} = require("@hashgraph/sdk");

const myAccountId =  "0.0.4567944"
const myPrivateKey = PrivateKey.fromString("302e020100300506032b6570042204203e91ca4b65b5c2d1fcf4705bb7cff98bc2d5f528e2e311192b8f259f1c529ec2")

const otherAccountId1 = "0.0.4567941"
const otherPrivateKey = PrivateKey.fromString("302e020100300506032b657004220420f39794519c55d5f05d45d8933eaef7dabf494b6b8466af12862bd7c5ce50e7b7")
const otherAccountId2 = "0.0.4567942"

const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

async function main() {

    //Create a transaction to schedule
    const transferTransaction = new TransferTransaction()
        .addHbarTransfer(otherAccountId1, Hbar.fromTinybars(-100))
        .addHbarTransfer(otherAccountId2, Hbar.fromTinybars(100));

    //Schedule a transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transferTransaction)
        .setScheduleMemo("Scheduled Transaction Test Cert!")
        .setAdminKey(myPrivateKey)
        .execute(client);

    //Get the receipt of the transaction
    const scheduledTxReceipt = await scheduleTransaction.getReceipt(client);

    //Get the schedule ID
    const scheduleId = scheduledTxReceipt.scheduleId;
    console.log("The schedule ID is " + scheduleId);

    //Get the scheduled transaction ID
    const scheduledTxId = scheduledTxReceipt.scheduledTransactionId;
    console.log("The scheduled transaction ID is " + scheduledTxId);

    //Create the transaction and sign with the admin key
    const transaction = await new ScheduleDeleteTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(myPrivateKey);

    //Sign with the operator key and submit to a Hedera network
    const txResponse = await transaction.execute(client);

    //Get the transaction receipt
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction status
    const transactionStatus = receipt.status;
    console.log("The transaction consensus status is " +transactionStatus);

    //Try to execute the deleted scheduled tx
    const scheduledSignTransaction = await new ScheduleSignTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(otherPrivateKey);

    const txResponse1 = await scheduledSignTransaction.execute(client);
    const receipt1 = await txResponse1.getReceipt(client);

    //Get the transaction status - should fail
    const transactionStatus1 = receipt1.status;
    console.log("The transaction consensus status is " + transactionStatus1);


    process.exit();
}

main();
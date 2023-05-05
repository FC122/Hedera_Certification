const { Client, PrivateKey, TopicCreateTransaction, TopicMessageSubmitTransaction, AccountId, Hbar } = require("@hashgraph/sdk");

// Acount 1
const account1 = PrivateKey.fromString("302e020100300506032b657004220420f39794519c55d5f05d45d8933eaef7dabf494b6b8466af12862bd7c5ce50e7b7")
const account1Id = "0.0.4567941"

// Acount 2
const account2 = PrivateKey.fromString("302e020100300506032b657004220420f1d5e07759450c9550f69a4ac662f95e5cd972a4648ebd29c95c073904a99de4")
const account2Id = "0.0.4567942"

// Acount 3
const account3 = PrivateKey.fromString("302e020100300506032b6570042204203e91ca4b65b5c2d1fcf4705bb7cff98bc2d5f528e2e311192b8f259f1c529ec2")
const account3Id = "0.0.4567944"

const client = Client.forTestnet()
    .setOperator(account1Id, account1)
    .setDefaultMaxTransactionFee(new Hbar(10));

const client2 = Client.forTestnet()
    .setOperator(account2Id, account2)
    .setDefaultMaxTransactionFee(new Hbar(10));

const client3 = Client.forTestnet()
    .setOperator(account3Id, account3)
    .setDefaultMaxTransactionFee(new Hbar(10));

async function createTopic() {
    let txResponse = await new TopicCreateTransaction()
        .setSubmitKey(account1.publicKey)
        .setSubmitKey(account2.publicKey)
        .execute(client);

    let receipt = await txResponse.getReceipt(client);
    return receipt.topicId.toString()
}

async function send_message(topicId, client) {
    const message = new Date().toISOString();

    const response = await new TopicMessageSubmitTransaction({
        topicId,
        message
    }).execute(client);

    let receipt = await response.getReceipt(client);
    console.log(`\nSent message to topic: ${topicId}, message: ${message}`);
    return receipt.status.toString()
}

async function main() {
    let topicId = await createTopic();
    console.log(`Created topic with id: ${topicId}`)
    console.log(`Look at topic messages: https://hashscan.io/testnet/topic/${topicId}`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await send_message(topicId, client3).catch((error) => console.log(`Err: ${error}`));
    await send_message(topicId, client2)
    process.exit()
}

main();
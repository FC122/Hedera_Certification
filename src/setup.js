const { 
    Client, 
    AccountCreateTransaction, 
    Hbar, 
    PrivateKey,
    PublicKey } = require("@hashgraph/sdk");
require('dotenv').config({ path: 'Hedera_Cert/.env' });

async function main() {
    const operatorPrivateKey = "3030020100300706052b8104000a0422042030b51126b79282c08cd86b050ac42ccaf0f8886a465fb713babba518191bb355"
    const operatorAccountId = "0.0.4539279"
  
    if (operatorPrivateKey == null || operatorAccountId == null) {
        throw new Error("Environment variables OPERATOR_KEY and OPERATOR_ID must be set.");
    }

    const client = Client.forTestnet()
        .setOperator(operatorAccountId, operatorPrivateKey);

    const accounts = [];

    for (let i = 1; i <= 5; i++) {
        const newKey = await PrivateKey.generate();
        const newPublicKey = newKey.publicKey;

        const response = await new AccountCreateTransaction()
            .setKey(newPublicKey)
            .setInitialBalance(new Hbar(2)) // Set initial balance to cover the transaction costs.
            .execute(client);

        const receipt = await response.getReceipt(client);
        const newAccountId = receipt.accountId;

        console.log(`Account${i} created with ID: ${newAccountId} and private key: ${newKey}`);

        accounts.push({
            accountId: newAccountId.toString(),
            privateKey: newKey.toStringDer(),
            publicKey: newPublicKey.toStringDer(),
        });
    }

    // Save the account details to a file
    const fs = require('fs');
    fs.writeFileSync('hedera_accounts.json', JSON.stringify(accounts, null, 4));

    process.exit()
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

const { PrivateKey, Client, Hbar, ContractCreateFlow, ContractExecuteTransaction, ContractFunctionParameters,
    ContractCallQuery
} = require("@hashgraph/sdk");

// Acount 1
const account1 = PrivateKey.fromString("302e020100300506032b657004220420f39794519c55d5f05d45d8933eaef7dabf494b6b8466af12862bd7c5ce50e7b7")
const account1Id = "0.0.4567941"

const client = Client.forTestnet();
client.setOperator(account1Id, account1);
client.setDefaultMaxTransactionFee(new Hbar(100));

const contractJson = require("./smart_contract.json");

async function deployContract() {
    const contractTx = await new ContractCreateFlow()
        .setBytecode(contractJson.bytecode)
        .setGas(200_000)
        .execute(client);

    const contractId = (await contractTx.getReceipt(client)).contractId;
    return contractId
}

async function interactWithContractFunction1(contractId) {
    const tx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction("function1", new ContractFunctionParameters().addUint16(4).addUint16(3))
        .execute(client);

    return Buffer.from((await tx.getRecord(client)).contractFunctionResult.bytes).toJSON().data.at(-1)
}

async function interactWithContractFunction2(contractId, n) {
    const tx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction("function2", new ContractFunctionParameters().addUint16(n))
        .execute(client);

    return Buffer.from((await tx.getRecord(client)).contractFunctionResult.bytes).toJSON().data.at(-1)
}

async function main() {
    let contractId = await deployContract();
    console.log(`ContractId: ${contractId}`)
    let r1 = await interactWithContractFunction1(contractId);
    console.log(`Res1: ${r1}`)
    let r2 = await interactWithContractFunction2(contractId, r1);
    console.log(`Res2: ${r2}`)
    process.exit()
}

main()
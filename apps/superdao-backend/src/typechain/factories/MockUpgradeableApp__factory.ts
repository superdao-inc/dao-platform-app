/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  MockUpgradeableApp,
  MockUpgradeableAppInterface,
} from "../MockUpgradeableApp";

const _abi = [
  {
    inputs: [],
    name: "getImplementationSlot",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "value",
            type: "address",
          },
        ],
        internalType: "struct StorageSlot.AddressSlot",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610110806100206000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80637a34c82114602d575b600080fd5b6033604f565b60405190516001600160a01b0316815260200160405180910390f35b60408051602081019091526000815260646081565b604080516020810190915290546001600160a01b03168152919050565b600060b160ae60017f797d7c7d0df25d67e029b044c5bcb2b89d68f6483382b5f85e64485950ed88d160b6565b90565b905090565b60008282101560d557634e487b7160e01b600052601160045260246000fd5b50039056fea26469706673582212201eab29c41dc52e5d8caa52532a6d6c1397d4fbed143ffcd01516b35f4023e63a64736f6c634300080c0033";

type MockUpgradeableAppConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockUpgradeableAppConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockUpgradeableApp__factory extends ContractFactory {
  constructor(...args: MockUpgradeableAppConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MockUpgradeableApp> {
    return super.deploy(overrides || {}) as Promise<MockUpgradeableApp>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): MockUpgradeableApp {
    return super.attach(address) as MockUpgradeableApp;
  }
  connect(signer: Signer): MockUpgradeableApp__factory {
    return super.connect(signer) as MockUpgradeableApp__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockUpgradeableAppInterface {
    return new utils.Interface(_abi) as MockUpgradeableAppInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockUpgradeableApp {
    return new Contract(address, _abi, signerOrProvider) as MockUpgradeableApp;
  }
}

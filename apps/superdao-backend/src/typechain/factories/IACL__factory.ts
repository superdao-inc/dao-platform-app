/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IACL, IACLInterface } from "../IACL";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "entity",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "app",
        type: "bytes32",
      },
      {
        internalType: "uint8",
        name: "permission",
        type: "uint8",
      },
    ],
    name: "addPermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "entity",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "app",
        type: "bytes32",
      },
    ],
    name: "getPermissions",
    outputs: [
      {
        internalType: "bytes2",
        name: "",
        type: "bytes2",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "entityAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "appAddress",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "permissionId",
        type: "uint8",
      },
    ],
    name: "hasPermission",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "entity",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "app",
        type: "bytes32",
      },
      {
        internalType: "uint8",
        name: "permission",
        type: "uint8",
      },
    ],
    name: "removePermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IACL__factory {
  static readonly abi = _abi;
  static createInterface(): IACLInterface {
    return new utils.Interface(_abi) as IACLInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): IACL {
    return new Contract(address, _abi, signerOrProvider) as IACL;
  }
}

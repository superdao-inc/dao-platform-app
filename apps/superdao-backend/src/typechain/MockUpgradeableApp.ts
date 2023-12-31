/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export type AddressSlotStruct = { value: string };

export type AddressSlotStructOutput = [string] & { value: string };

export interface MockUpgradeableAppInterface extends utils.Interface {
  functions: {
    "getImplementationSlot()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getImplementationSlot",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "getImplementationSlot",
    data: BytesLike
  ): Result;

  events: {};
}

export interface MockUpgradeableApp extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MockUpgradeableAppInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    getImplementationSlot(
      overrides?: CallOverrides
    ): Promise<[AddressSlotStructOutput]>;
  };

  getImplementationSlot(
    overrides?: CallOverrides
  ): Promise<AddressSlotStructOutput>;

  callStatic: {
    getImplementationSlot(
      overrides?: CallOverrides
    ): Promise<AddressSlotStructOutput>;
  };

  filters: {};

  estimateGas: {
    getImplementationSlot(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    getImplementationSlot(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}

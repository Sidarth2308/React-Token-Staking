import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import contract from "../contract.json";
import tokenAbiContract from "./tokenAbi.json";
import { Flex, Input, Spinner } from "@chakra-ui/react";
import Navbar from "../Components/Navbar";
import { contractAddress, tokenContractAddress } from "../config/config";

import { useNavigate } from "react-router-dom";

const tokenAbi = tokenAbiContract.abi;
const abi = contract.abi;
const insertCommas = (value) => {
  return value;
};
export default function Mint() {
  const navigate = useNavigate();
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [mintValue, setMintValue] = useState("");
  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have installed Metamask");

      navigate("/");
    } else {
      console.log("Wallet exists");
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");

      navigate("/");
    }
  };
  const mintTokenHandler = async () => {
    try {
      const { ethereum } = window;
      setLoading(true);
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);
        console.log("Initialize payment");
        let nftTxn = await nftContract.mint_ex(currentAccount, mintValue);

        console.log("Mining... please wait");
        await nftTxn.wait();
        setLoading(false);
        setMintValue("0");
        console.log(
          `Mined, see transaction:  https://goerli.etherscan.io/tx/${nftTxn.hash}`
        );
        checkUserBalance();
      } else {
        console.log("Ethereum object does not exist");
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const checkUserBalance = async () => {
    const { ethereum } = window;
    try {
      if (currentAccount && ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const newContract = new ethers.Contract(
          tokenContractAddress,
          tokenAbi,
          signer
        );

        const balance = await newContract.balanceOf(currentAccount);
        const balanceDecoded = ethers.utils.formatEther(balance);
        setAccountBalance(balanceDecoded);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const mintTokenButton = () => {
    return (
      <Flex onClick={mintTokenHandler} className="Mint-Button">
        Mint CUST Token
      </Flex>
    );
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  useEffect(() => {
    checkUserBalance();
  }, [currentAccount]);

  return (
    <Flex className="Container">
      <Navbar />
      <Flex className="Mint-Container">
        <Flex className="Mint-Balance">
          Your CUST Token balance : &nbsp; <b>{accountBalance}</b> &nbsp; CUST
        </Flex>
        {loading ? (
          <Spinner color="white" mt="50px" />
        ) : (
          <Flex direction="column" mt="50px">
            <Flex className="Mint-Input">
              <Flex className="Mint-Label">Enter Mint Amount</Flex>
              <Input
                color="white"
                value={insertCommas(mintValue)}
                onChange={(e) => {
                  setMintValue(e.target.value);
                }}
              />
            </Flex>
            {mintTokenButton()}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

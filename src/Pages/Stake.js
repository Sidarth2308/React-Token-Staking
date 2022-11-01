import { Flex, Input, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "../Components/Navbar";
import contract from "../contract.json";
import { useNavigate } from "react-router-dom";
import tokenAbiContract from "./tokenAbi.json";

const contractAddress = "0xa754802CC242aF470FD62edD2c98ab6cce739abA";
const tokenContractAddress = "0x925947cB4dcDd71676D9a50d77720A1441460e37";

const tokenAbi = tokenAbiContract.abi;
const abi = contract.abi;

const stakePercentage = "5";

export default function Stake() {
  const navigate = useNavigate();
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [checkStakeLoading, setCheckStakeLoading] = useState(false);
  const [stakeCreated, setStakeCreated] = useState(false);
  const [fetchingStakeInfo, setFetchingStakeInfo] = useState(false);
  const [stakeForm, setStakeForm] = useState({
    duration: "0",
    amount: "0"
  });
  const [stakeInfo, setStakeInfo] = useState({
    amount: "",
    duration: "",
    rate: ""
  });
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
  const checkUserBalance = async () => {
    try {
      const { ethereum } = window;
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
  const startStake = async () => {
    try {
      const { ethereum } = window;
      setLoading(true);
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const stakeContract = new ethers.Contract(contractAddress, abi, signer);
        console.log("Initialize payment");
        let stakeTxn = await stakeContract.create_stake(
          currentAccount,
          stakePercentage,
          stakeForm.duration,
          stakeForm.amount
        );

        console.log("Creating stake... please wait");
        await stakeTxn.wait();
        setLoading(false);
        setStakeCreated(true);
        console.log(
          `Mined, see transaction: https://goerli.etherscan.io/tx/${stakeTxn.hash}`
        );
        checkUserBalance();
      } else {
        console.log("Ethereum object does not exist");
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const stakeTokenButton = () => {
    return (
      <Flex onClick={startStake} className="Mint-Button">
        Create Stake
      </Flex>
    );
  };
  const checkStakeCreated = async () => {
    setCheckStakeLoading(true);
    try {
      const { ethereum } = window;
      if (currentAccount && ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const newContract = new ethers.Contract(contractAddress, abi, signer);

        const result = await newContract.hasStaked(currentAccount);

        setCheckStakeLoading(false);
        setStakeCreated(result);
      }
    } catch (err) {
      console.log(err);
      setCheckStakeLoading(false);
    }
  };
  const getStakeInformation = async () => {
    setFetchingStakeInfo(true);
    try {
      const { ethereum } = window;
      if (currentAccount && ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const newContract = new ethers.Contract(contractAddress, abi, signer);

        const result = await newContract.addToStake(currentAccount);
        setFetchingStakeInfo(false);
        setStakeInfo({
          amount: ethers.utils.formatEther(result[0]._hex),
          duration: parseInt(result[2]._hex, 16).toString(),
          rate: parseInt(result[3]._hex, 16).toString()
        });
        console.log(result);
      }
    } catch (err) {
      console.log(err);
      setFetchingStakeInfo(true);
    }
  };
  useEffect(() => {
    checkWalletIsConnected();
    checkStakeCreated();
    checkUserBalance();
  }, [currentAccount]);
  useEffect(() => {
    if (stakeCreated) {
      getStakeInformation();
    }
  }, [stakeCreated]);
  return (
    <Flex className="Container">
      <Navbar />
      <Flex className="Stake-Container">
        <Flex className="Mint-Balance">
          Your CUST Token balance : &nbsp; <b>{accountBalance}</b> &nbsp; CUST
        </Flex>
        {checkStakeLoading ? (
          <Spinner />
        ) : stakeCreated ? (
          <>
            <Flex className="Stake-CreatedHeading">Stake already created</Flex>
            {fetchingStakeInfo ? (
              <Spinner />
            ) : (
              <Flex className="Stake-Info">
                <Flex className="Stake-InfoField">
                  <Flex className="Stake-InfoLabel">
                    Staked Amount : &nbsp;
                  </Flex>
                  <Flex className="Stake-InfoValue">
                    <b>{stakeInfo.amount} </b>&nbsp; CUST
                  </Flex>
                </Flex>
                <Flex className="Stake-InfoField">
                  <Flex className="Stake-InfoLabel">
                    Staked Duration :&nbsp;
                  </Flex>
                  <Flex className="Stake-InfoValue">{stakeInfo.duration}</Flex>
                </Flex>
                <Flex className="Stake-InfoField">
                  <Flex className="Stake-InfoLabel">Staking Rate :&nbsp;</Flex>
                  <Flex className="Stake-InfoValue">{stakeInfo.rate}%</Flex>
                </Flex>
              </Flex>
            )}
          </>
        ) : (
          <>
            <Flex className="Stake-Form">
              <Flex className="Stake-Field">
                <Flex className="Stake-Label">Stake Duration (In Seconds)</Flex>
                <Input
                  value={stakeForm.duration}
                  onChange={(e) => {
                    setStakeForm((prev) => {
                      return { ...prev, duration: e.target.value };
                    });
                  }}
                />
              </Flex>
              <Flex className="Stake-Field">
                <Flex className="Stake-Label">Stake Amount</Flex>
                <Input
                  value={stakeForm.amount}
                  onChange={(e) => {
                    setStakeForm((prev) => {
                      return { ...prev, amount: e.target.value };
                    });
                  }}
                />
              </Flex>
            </Flex>
            <Flex>{stakeTokenButton()}</Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
}

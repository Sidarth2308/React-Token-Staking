import { Flex, Input, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "../Components/Navbar";
import contract from "../contract.json";
import { useNavigate } from "react-router-dom";
import tokenAbiContract from "./tokenAbi.json";
import { contractAddress, tokenContractAddress } from "../config/config";

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
  const [stakeTimeLeft, setStakeTimeLeft] = useState(0);
  const [stakeTimeFetch, setStakeTimeFetch] = useState(false);
  const [stakeRewardFetch, setStakeRewardFetch] = useState(false);
  const [stakeReward, setStakeReward] = useState("0");
  const [unStakeLoading, setUnStakeLoading] = useState(false);
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
        console.log("Initializing staking payment");
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
          `Transaction complete, see transaction: https://goerli.etherscan.io/tx/${stakeTxn.hash}`
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
          duration: (
            parseInt(result[2]._hex, 16) - parseInt(result[1]._hex, 16)
          ).toString(),
          rate: parseInt(result[3]._hex, 16).toString()
        });
      }
    } catch (err) {
      console.log(err);
      setFetchingStakeInfo(true);
    }
  };
  const checkStakeTimeLeft = async () => {
    setStakeTimeFetch(true);
    try {
      const { ethereum } = window;
      if (currentAccount && ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const newContract = new ethers.Contract(contractAddress, abi, signer);

        const result = await newContract.timeleft(currentAccount);
        const answer = parseInt(result._hex, 16);
        if (answer < 0) {
          setStakeTimeLeft(0);
        } else {
          setStakeTimeLeft(answer);
        }

        setStakeTimeFetch(false);
      }
    } catch (err) {
      console.log(err);
      setStakeTimeFetch(true);
    }
  };
  const checkStakeReward = async () => {
    setStakeRewardFetch(true);
    try {
      const { ethereum } = window;
      if (currentAccount && ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const newContract = new ethers.Contract(contractAddress, abi, signer);

        const result = await newContract.checkReward(currentAccount);
        setStakeReward(parseInt(result._hex, 16).toString());
        setStakeRewardFetch(false);
      }
    } catch (err) {
      console.log(err);
      setStakeRewardFetch(true);
    }
  };
  const unStakeHandler = async () => {
    try {
      const { ethereum } = window;
      setUnStakeLoading(true);
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const stakeContract = new ethers.Contract(contractAddress, abi, signer);
        console.log("Initializing unstaking");
        let stakeTxn = await stakeContract.reward_per_person(currentAccount);

        console.log("Unstaking present stake... please wait");
        await stakeTxn.wait();
        setUnStakeLoading(false);
        setStakeCreated(false);
        console.log(
          `Transaction complete, see transaction: https://goerli.etherscan.io/tx/${stakeTxn.hash}`
        );
        checkUserBalance();
      } else {
        console.log("Ethereum object does not exist");
        setUnStakeLoading(false);
      }
    } catch (err) {
      setUnStakeLoading(false);
      console.log(err);
    }
  };
  const unStakeTokenButton = () => {
    return (
      <Flex onClick={unStakeHandler} className="Mint-Button">
        {unStakeLoading ? <Spinner color="white" /> : "Un-Stake current stake"}
      </Flex>
    );
  };
  useEffect(() => {
    checkWalletIsConnected();
    checkStakeCreated();
    checkUserBalance();
  }, [currentAccount]);
  useEffect(() => {
    if (stakeCreated) {
      checkStakeTimeLeft();
      checkStakeReward();
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
          <Spinner color="white" />
        ) : stakeCreated ? (
          <>
            <Flex className="Stake-CreatedHeading">Stake already created</Flex>
            {fetchingStakeInfo || stakeTimeFetch || stakeRewardFetch ? (
              <Spinner color="white" />
            ) : (
              <>
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
                    <Flex className="Stake-InfoValue">
                      {stakeInfo.duration} Seconds
                    </Flex>
                  </Flex>
                  <Flex className="Stake-InfoField">
                    <Flex className="Stake-InfoLabel">
                      Staking Rate :&nbsp;
                    </Flex>
                    <Flex className="Stake-InfoValue">{stakeInfo.rate}%</Flex>
                  </Flex>
                  <Flex className="Stake-TimeLeft">
                    <Flex className="Stake-TimeLeftLabel">
                      Time left until Stake matures :&nbsp;
                    </Flex>
                    <Flex className="Stake-TimeLeftValue">
                      {stakeTimeLeft} seconds
                    </Flex>
                  </Flex>
                  <Flex className="Stake-Reward">
                    <Flex className="Stake-RewardLabel">
                      Stake reward if un-staked right now :&nbsp;
                    </Flex>
                    <Flex className="Stake-RewardValue">{stakeReward}</Flex>
                  </Flex>
                </Flex>
                <Flex>{unStakeTokenButton()}</Flex>
              </>
            )}
          </>
        ) : loading ? (
          <Spinner color="white" />
        ) : (
          <>
            <Flex className="Stake-Form">
              <Flex className="Stake-Field">
                <Flex className="Stake-Label">Stake Duration (In Seconds)</Flex>
                <Input
                  color="white"
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
                  color="white"
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

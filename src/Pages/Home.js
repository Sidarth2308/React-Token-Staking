import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import Navbar from "../Components/Navbar";

import { useNavigate } from "react-router-dom";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const navigate = useNavigate();
  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have installed Metamask");
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
    }
  };
  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please Install Metamask");
    }
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });
      console.log("Found an account! address : ", accounts[0]);
      navigate("/mint");
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };
  const connectWalletButton = () => {
    return (
      <Flex onClick={connectWalletHandler} className="Home-ConnectWallet">
        Connect Wallet
      </Flex>
    );
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, [currentAccount]);

  return (
    <Flex className="Container">
      <Navbar />
      <Flex className="Home-Container">
        <Flex>{connectWalletButton()}</Flex>
      </Flex>
    </Flex>
  );
}

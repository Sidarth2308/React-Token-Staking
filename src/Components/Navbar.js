import { Flex } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const navigate = useNavigate();
  return (
    <Flex className="Navbar-Container">
      <Flex className="Navbar-Links">
        <Flex
          className="Navbar-Link"
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </Flex>
        <Flex
          className="Navbar-Link"
          onClick={() => {
            navigate("/mint");
          }}
        >
          Mint Token
        </Flex>
        <Flex
          className="Navbar-Link"
          onClick={() => {
            navigate("/staking");
          }}
        >
          Stake Token
        </Flex>
      </Flex>
    </Flex>
  );
}

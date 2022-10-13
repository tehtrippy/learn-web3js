import React, { useEffect, useState } from "react";
import Web3 from "web3";

const { REACT_APP_PROVIDER } = process.env;

const web3 = new Web3(REACT_APP_PROVIDER || "");

const App: React.FC<{}> = () => {
  const [myAccount, setMyAccount] = useState<any>();
  const [accounts, getAccounts] = useState<any>([]);
  const [sendTo, setSendTo] = useState<string>();
  const [amount, setAmount] = useState<string>();

  const getMyAccount = async () => {
    const myAccount = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const getBalance = await web3.eth.getBalance(myAccount[0]);

    setMyAccount({
      address: myAccount[0],
      balance: web3.utils.fromWei(getBalance, "ether"),
    });
  };

  const getAccountsInChain = async () => {
    const addresses: any = [];
    const accounts = await web3.eth.getAccounts();
    for (const account of accounts) {
      const getBalance = await web3.eth.getBalance(account);
      addresses.push({
        account,
        balance: web3.utils.fromWei(getBalance, "ether"),
      });
    }
    getAccounts(addresses);
  };

  const sendEth = async () => {
    if (!sendTo) {
      console.log({ status: `error` });
    } else {
      try {
        await web3.eth.sendTransaction({
          from: myAccount.address,
          to: sendTo,
          value: web3.utils.toWei(amount || "", "ether"),
        });
        console.log({
          status: `success`,
          message: `send ${amount} ETHs to ${sendTo}`,
        });
        await getMyAccount();
        await getAccountsInChain();
        setAmount("");
      } catch {
        console.log({ status: "error" });
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        console.log("window.ethereum not found");
      } else {
        await getMyAccount();
        await getAccountsInChain();
      }
    };

    init();
  }, []);

  if (!REACT_APP_PROVIDER) {
    return <div>Please set ENV</div>;
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto min-h-screen space-y-4">
      {/* Account Info */}
      {myAccount && (
        <>
          <div className="flex justify-end">
            <div className="flex flex-col">
              <span className="block text-gray-500 text-sm">
                Address: {myAccount.address}
              </span>
              <span className="block text-gray-500 self-end text-xs">
                Balance: {parseFloat(myAccount.balance || "").toFixed(2)} ETHs
              </span>
            </div>
          </div>
          <hr className="mt-4 border-indigo-500 border-2" />
        </>
      )}

      {/* Addresses in Chain */}
      {accounts && (
        <div>
          <span className="font-bold text-indigo-600 text-2xl">
            Addresses in Chain
          </span>
          <table className="table-auto mt-4">
            <thead>
              <tr>
                <th className="px-4">#</th>
                <th className="px-4">Wallets</th>
                <th className="px-4">ETHs</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(({ account, balance }: any, key: any) => (
                <tr key={key} className="text-center">
                  <td>{key + 1}</td>
                  <td
                    className="cursor-pointer hover:text-indigo-500 text-left"
                    onClick={() => setSendTo(account)}
                  >
                    {account}
                  </td>
                  <td>{parseFloat(balance).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="mt-4 border-indigo-500 border-2" />
        </div>
      )}

      {/* Send ETH */}
      <div className="mt-4">
        <p className="font-bold text-indigo-600 text-2xl">Send ETH</p>
        <p className="font-bold text-indigo-600 text-sm">
          (click addresses in chain to send)
        </p>
        <div className="space-y-4 mt-4">
          <p>
            Address: <span className="text-green-500 font-bold">{sendTo}</span>
          </p>
          <div className="flex items-center space-x-4">
            <span>Amount:</span>
            <input
              type="text"
              value={amount || ""}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-gray-500 rounded px-2"
            />
            <button
              className="bg-green-500 px-4 py-1 rounded-lg text-white"
              onClick={() => sendEth()}
            >
              Send
            </button>
          </div>
        </div>
        <hr className="mt-4 border-indigo-500 border-2" />
      </div>
    </div>
  );
};

export default App;

 import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "./contractInfo";

function App() {
  const [account, setAccount] = useState("");
  const [productName, setProductName] = useState("");
  const [company, setCompany] = useState("");
  const [products, setProducts] = useState([]);

  const statusLabels = ["🚜 Produced", "🚚 In Transit", "✅ Delivered"];

  async function connectWallet() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], 
        });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setAccount(await signer.getAddress());
        fetchProducts();
      } catch (err) {
        console.error("Connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  }

  async function addProduct() {
    if (!productName || !company) return alert("Please enter all details!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const tx = await contract.registerProduct(productName, company);
      alert("Transaction sent! Waiting for confirmation...");
      await tx.wait();
      
      alert("Product Registered Successfully!");
      setProductName(""); // Clear input
      setCompany(""); // Clear input
      fetchProducts(); 
    } catch (err) { 
      console.error(err);
      alert("Registration failed! Do you have enough Sepolia ETH?"); 
    }
  }

  async function updateStatus(id) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Converting to Number first to ensure it's a clean integer for the contract
      const cleanId = Number(id);
      console.log("Updating ID:", cleanId);

      const tx = await contract.updateStatus(cleanId); 
      
      alert("Update request sent to MetaMask! Confirm to proceed.");
      await tx.wait(); 
      
      alert("Status updated successfully!");
      fetchProducts(); 
    } catch (err) {
      console.error("Update Error:", err);
      // Detailed alert to help you during the demo
      alert("Update failed. This usually happens if the Smart Contract logic rejects the transaction or the ABI is mismatched.");
    }
  }

  async function fetchProducts() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const count = await contract.productCount();
      
      let items = [];
      for (let i = 1; i <= count; i++) {
        const p = await contract.products(i);
        items.push({ 
            id: p[0].toString(), 
            name: p[1], 
            company: p[2], 
            status: Number(p[4]) 
        });
      }
      setProducts(items);
    } catch (err) { 
        console.error("Fetch failed", err); 
    }
  }

  useEffect(() => {
    if (account) fetchProducts();
  }, [account]);

  return (
    <div style={{ padding: "40px", fontFamily: 'Segoe UI', textAlign: "center", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <h1 style={{color: "#2c3e50"}}>🌐 Real-Time Blockchain Supply Chain</h1>
      
      {!account ? (
        <button onClick={connectWallet} style={{ padding: "12px 24px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
          Connect Official Wallet
        </button>
      ) : (
        <div>
          <p>Entity Wallet: <b>{account}</b></p>
          
          <div style={{ background: "white", padding: "25px", borderRadius: "12px", display: "inline-block", marginBottom: "30px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
            <h3>Register Product Origin</h3>
            <input value={productName} placeholder="Product Name" onChange={(e)=>setProductName(e.target.value)} style={{margin: "5px", padding: "10px", borderRadius: "4px", border: "1px solid #ddd"}} />
            <input value={company} placeholder="Company Name" onChange={(e)=>setCompany(e.target.value)} style={{margin: "5px", padding: "10px", borderRadius: "4px", border: "1px solid #ddd"}} />
            <button onClick={addProduct} style={{padding: "10px 20px", backgroundColor: "#2ecc71", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold"}}>Mint to Blockchain</button>
          </div>

          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <h3>Global Tracking Ledger</h3>
                <button onClick={fetchProducts} style={{padding: "5px 10px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#fff"}}>🔄 Sync Ledger</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}>
              <thead>
                <tr style={{ backgroundColor: "#34495e", color: "white" }}>
                  <th style={{padding: "15px"}}>ID</th>
                  <th>Product</th>
                  <th>Origin</th>
                  <th>Current Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                    <tr><td colSpan="5" style={{padding: "20px"}}>No products found on this contract.</td></tr>
                ) : (
                    products.map((p, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{padding: "15px"}}>{p.id}</td>
                        <td style={{fontWeight: "500"}}>{p.name}</td>
                        <td>{p.company}</td>
                        <td style={{fontWeight: "bold", color: "#2980b9"}}>{statusLabels[p.status]}</td>
                        <td>
                        {p.status < 2 ? (
                            <button onClick={() => updateStatus(p.id)} style={{padding: "8px 12px", cursor: "pointer", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", fontWeight: "500"}}>
                            Update Status
                            </button>
                        ) : (
                            <span style={{color: "#27ae60", fontWeight: "bold"}}>Item Delivered</span>
                        )}
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
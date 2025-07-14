import { useState } from "react";
import "./Display.css";

const Display = ({ contract, account }) => {
  const [data, setData] = useState([]);
  const [inputAddress, setInputAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const IPFS_GATEWAYS = [
    "https://ipfs.io/ipfs/",
    "https://dweb.link/ipfs/",
    "https://cf-ipfs.com/ipfs/",
    "https://gateway.pinata.cloud/ipfs/"
  ];

  const getCleanCID = (url) => {
    return url.replace(/^ipfs:\/\//, "")
             .replace(/^https?:\/\/.+\/ipfs\//, "")
             .replace(/^\//, "");
  };

  const getdata = async () => {
    const targetAddress = inputAddress || account;
    
    if (!targetAddress) {
      setError("Please connect wallet or enter an address");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const dataArray = await contract.display(targetAddress);
      
      if (!dataArray || dataArray.length === 0) {
        setError("No images found for this address");
        setData([]);
        return;
      }

      const items = await Promise.all(
        dataArray.map(async (item) => {
          const cid = getCleanCID(item);
          let workingUrl = `${IPFS_GATEWAYS[0]}${cid}`;
          
          // Verify the gateway works
          try {
            const response = await fetch(workingUrl, { method: 'HEAD' });
            if (!response.ok) throw new Error("Gateway failed");
          } catch {
            // Fallback to the next available gateway
            for (let i = 1; i < IPFS_GATEWAYS.length; i++) {
              try {
                const testUrl = `${IPFS_GATEWAYS[i]}${cid}`;
                const response = await fetch(testUrl, { method: 'HEAD' });
                if (response.ok) {
                  workingUrl = testUrl;
                  break;
                }
              } catch (e) {
                console.log(`Gateway ${IPFS_GATEWAYS[i]} failed`);
              }
            }
          }

          return {
            cid,
            url: workingUrl,
            owner: targetAddress
          };
        })
      );
      
      setData(items);
    } catch (e) {
      console.error("Error fetching data:", e);
      setError(e.message.includes("access") 
        ? "You don't have access" 
        : "Error loading images");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="display-container">
      <div className="search-controls">
        <input
          type="text"
          placeholder="Enter Ethereum Address"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          className="address-input"
        />
        <button 
          onClick={getdata} 
          disabled={isLoading}
          className="search-button"
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Loading...
            </>
          ) : "Get Images"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="image-grid">
        {data.map((item, i) => (
          <div key={`${item.cid}-${i}`} className="image-card">
            <img
              src={item.url}
              alt={`IPFS Content ${i}`}
              onError={(e) => {
                // Try next available gateway
                const currentGateway = new URL(e.target.src).origin;
                const nextGateway = IPFS_GATEWAYS.find(g => !g.includes(currentGateway));
                if (nextGateway) {
                  e.target.src = `${nextGateway}${item.cid}`;
                }
              }}
              className="ipfs-image"
            />
            <div className="image-info">
              <p className="cid">CID: {item.cid}</p>
              <p className="address">
                Owner: {item.owner.slice(0, 6)}...{item.owner.slice(-4)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Display;
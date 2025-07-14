# 🖼️ Decentralized Image Sharing DApp (Wallet-Based Access via IPFS + Pinata)

A privacy-focused decentralized application that allows users to **upload images**, store them securely on **IPFS using Pinata**, and **share view-only access** with specific wallet addresses via a unique link.

---

## 🚀 Key Features

- 📤 Upload images to **IPFS** through **Pinata**
- 🧾 Store image metadata and CID securely
- 👁️ View images through a **verifiable wallet login**
- 🔗 Share access with **specific wallet addresses only**
- 🔐 Prevent unauthorized users from viewing shared content

---

## 🛠️ Tech Stack

| Layer         | Technology                  |
|---------------|------------------------------|
| Frontend      | React.js, Tailwind CSS        |
| IPFS Storage  | Pinata + IPFS                 |
| Wallet Auth   | MetaMask, Ethers.js/Web3.js,solidity|   |


---

## 🌐 How It Works
## ✅ Upload Flow
User connects MetaMask

Uploads an image file

Image is pinned to IPFS via Pinata

App receives and stores the CID

User specifies wallet address(es) who can access the image

## ✅ Access Flow
Recipient opens the shared link

## Connects their MetaMask wallet

The app checks if their address matches one in the access list

If yes → image is displayed
If not → access is denied

## 🔐 Access Control
Access is managed by mapping wallet addresses to IPFS hashes

Can be stored off-chain (e.g. in Firebase, localStorage, or a simple backend)

No one can view the image without:

The correct CID

A whitelisted wallet address




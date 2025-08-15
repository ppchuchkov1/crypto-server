
## ⚡ Getting Started / Installation

### Frontend - crypto-client

```bash
npm i
npm run dev
```

### Backend - crypto-server

Build and start the backend server (with MongoDB, Redis, and Nginx) using Docker:

```bash
docker-compose up --build
```


## 🛠️ Technologies Used

- **Front-end:** React.js, Zustand for state management, Tailwind CSS for styling  
- **Back-end:** Node.js, Express.js, Mongoose for MongoDB, JWT for authentication, Stripe for deposits  
- **Database / Cache:** MongoDB, Redis  
- **APIs:** CoinGecko API for real-time cryptocurrency data, stored in Redis and updated daily via cron job  
- **Deployment / DevOps:** AWS EC2 (Ubuntu), SSH for remote access, Docker, Nginx for reverse proxy  

---

## 💵 User & Wallet

Each user has a wallet containing their USD balance, which can be topped up via Stripe.  
Wallet also tracks owned cryptocurrencies and NFTs.  

**Screenshot:**  
![Wallet Screenshot](screenshots/wallet.png)

---

## 📈 Cryptocurrency Trading

Users can buy and sell cryptocurrencies at prices fetched from CoinGecko API and stored in Redis.  
Every transaction updates the user’s USD balance automatically.  
Crypto prices are refreshed daily via a cron job to ensure transactions reflect up-to-date market values.  

**Screenshot:**  
![Crypto Trading Screenshot](screenshots/crypto.png)

---

## 🖼️ NFT Marketplace

NFTs are initially listed in the marketplace as unowned, available for purchase.  
Once purchased, users own the NFT and can relist it at any price in the marketplace.  
Other users can then purchase listed NFTs, with transactions updating the seller and buyer USD balances automatically.  

**Screenshot:**  
![NFT Marketplace Screenshot](screenshots/nft.png)

---

## 🎰 Casino Game & Bonus Spins

Platform includes a casino game with a bonus of 7 free spins.  
Users can purchase the bonus for a specific stake to unlock the spins.  
Each spin multiplies winnings based on the spin number (e.g., the 5th spin multiplies winnings by 5).  
The game integrates with the user’s wallet, updating USD balance automatically 💵 after each spin.  

**Screenshot:**  
![Casino Screenshot](screenshots/casino.png)

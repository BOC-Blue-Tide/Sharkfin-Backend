# Sharkfin-Backend
 ![Screen Shot 2023-04-01 at 1 53 58 AM](https://user-images.githubusercontent.com/106402982/229268318-7147e3f8-c9e4-4fc9-b052-abe22507de76.png)
# Stock Trading Platform
SharkFin is a stock-trading application designed for entry-level traders. Our app provides a user-friendly interface and a fresh aesthetic that makes it fun for Gen Z, millennials, and young adults to invest in the stock market. With SharkFin, users can quickly and easily buy and sell stocks, track their portfolio's performance against their friends, and partake in friendly competition on a quarterly basis.

## Table of Contents
- [SharkFin Features](#sharkfin-features)
  - [Portfolio](#portfolio)
  - [Stock and Crypto Trade](#stock-and-crypto-trade)
  - [Friend Leaderboard](#friend-leaderboard)
  - [Chat Messaging](#chat-messaging)
  - [Account Information](#account-information)
- [Getting Started](#getting-started)

## SharkFin Features

### Portfolio
On the home page, users can see a comprehensive view of their portfolio's performance, including its overall value, how it has changed over different time periods (1 day, 1 week, 1 month, 3 months, 1 year, and 5 year), and how much of it is invested in each stock.

The asset distribution chart provides a visual representation of the user's portfolio allocation, making it easy to see which stocks are driving the portfolio's performance.

![Screen Shot 2023-04-01 at 12 31 13 PM](https://user-images.githubusercontent.com/106402982/229303164-e415c04e-86ac-4315-a5bc-10b0764d3f5a.png)

### Stock and Crypto Trade
Users can quickly find the stocks they're interested in and place orders to buy or sell them. The search bar provides recommendations of 
stock symbols that relate to what the user is typing.
![Screen Shot 2023-03-31 at 5 17 20 PM](https://user-images.githubusercontent.com/106402982/229232987-8e9a9093-14eb-4e78-8bef-dc0a6a1e02f9.png)
![stock gif](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTY4YTFjYmJkNmUzMTNiZGVlODg4MDkzMWVhZmZhMzEyMDZlOTc5ZiZjdD1n/OiLlt6hWC8lnwF1Nd5/giphy.gif)

After users buy or sell their holdings, users can review their past trades in the Transactions tab. This includes the five most recent trades with the option to see more trades and filter by "buy" or "sell".

![Transaction history gif](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTg1N2QzMDA1NmMyZjk3ODdjZmY5M2RiMTM0NDUxMWMwMjM3OTc5ZCZjdD1n/c0erEKN7FDerUzXV80/giphy.gif)


### Friend Leaderboard
Users can see who has added them as a friend on SharkFin and accept or decline their requests. They can also search for new friends using their email. Once connected, the friends are displayed on a leaderboard that lets you see how your portfolio ranks against your friends.

![Friend gif](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDU2ZWNlZjdjMWQ2Y2RiOWQ3NjhhMzRiZmNkNGI1Mjg3NTQ0N2NjMSZjdD1n/7DH3zVWccv90KCOykZ/giphy.gif)

### Chat Messaging
The chat messaging module displays the list of your friends and allows you to keep in touch and discuss trading strategies. The UI follows familiar messaging applications that Gen Z's and Millenials know and love.

![Chat gif](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2FhODc0MmYyYTgyZDBkNDBiODEzNDRlMTQ2MzIyODMxOWUxZTE4YSZjdD1n/hyb7T6iLRGgdHu6t8g/giphy.gif)

### Account Information
The login is set up with GoogleAuth so that users can securely log in to the app using their Google credentials. Once logged in, users will be prompted to enter their bank account information to get started. Like the stock/crpyto search bar, the field to enter bank will search for American banks that match the users' input.

![Screen Shot 2023-03-31 at 5 51 52 PM](https://user-images.githubusercontent.com/106402982/229240036-15b46119-42b2-4896-890f-51ec419c4c42.png)

When the bank account information is loaded, the user can deposit funds to their account to start trading. Given that this application is targeted for young adults and promotes competition, the user is capped at depositing a net of $1000.

![Deposit gif](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjk1ZDIxZGM4YmM4MDUxODJkYTFjMjIyZjFhYTAzMGRhM2RkNDMzMSZjdD1n/oAM1SADElMzMGTRwk3/giphy.gif)

## Getting Started
This guide will help you get started with the app and start exploring its features.

### Prerequisites
Before you begin, you'll need to make sure you have the following installed:

- Nodejs
- PostgreSQL with [Timescaledb](https://docs.timescale.com/self-hosted/latest/install/) extension

### Installation
To install the app, follow these steps:

- run `npm install` to install all dependencies
- run `npm run start-prod` on the frontend repository and run `npm start` on the backend respository
- instructions on how to create and copy data into your PostgreSQL database are included in the `database/schema.sql` file

# frn-tg-v2 open source bot

**Author:** frnwot  
**GitHub:** [frnwot](https://github.com/frnwot)  
**Email:** frnbuid2005@gmail.com  
**Telegram:** @FARHAN_MUH_TASIM  
**Instagram:** @frn_prime

---

## Project overview

`frn-tg-v2` is a Telegram bot project adapted and renamed from the original repository. This repository has been cleaned and prepared so you can push it directly to your GitHub account and deploy the bot.

---

## Quick features (detected)

- Project name changed to **frn-tg-v2**
- All authors/credits replaced with **frnwot**
- Cleaned git metadata so you can initialize your own repo
- Professional README and setup guide

---

## Requirements

Depending on the bot implementation detected in the project, install the following (examples):

- Node.js (v16 or newer) if `package.json` exists.
- Python 3.8+ if `requirements.txt` or `.py` bot files exist.

---

## Setup guide (step-by-step)

### 1. Prepare your machine
- Install Node.js (LTS) from https://nodejs.org if this is a Node.js bot.
- Or install Python 3.8+ and pip if the bot is Python-based.

### 2. Unzip & open project
```bash
git https://github.com/frnwot/frn-tg-v2.git
cd frn-tg-v2
```

### 3a. If Node.js project
```bash
# install dependencies
npm install

# configure env variables
# copy copy your token for bot_father and past config.json and edit
location 'config.json`
like = "token": "your_token",
# run the bot
npm start
# or
node index.js
```

### 3b. If you make these Python project 
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# configure env file or config.json
cp .env.example .env
# edit .env

python bot.py
```

### 4. GitHub ready
This project had its original `.git` metadata removed. To push to your GitHub account (`frnwot`), run:
```bash
git init
git add .
git commit -m "Initial commit - frn-tg-v2"
git branch -M main
# create a repo on GitHub named frn-tg-v2, then:
git remote add origin git@github.com: yourname/frn-tg-v2.git
git push -u origin main
```

---

## How to add new commands (example)

Below is a general pattern for adding a new command (Node.js example). Adjust to your bot framework.

**File:** `commands/ping.js`
```js
module.exports = {
  name: "ping",
  description: "Responds with pong and latency",
  async execute(message, args) {
    const start = Date.now();
    // reply depends on framework
    await message.reply("Pong!");
    const latency = Date.now() - start;
    console.log(`Ping command used. Latency: ${latency}ms`);
  }
};
```

**How to register:**
- Place your command file in the `commands/` folder.
- Ensure the bot's command loader scans that folder and registers commands (look for code that reads `./commands` or similar).

---

## How to deploy the bot

1. Choose a host: VPS, Heroku (deprecated for free), Railway, Replit, or any cloud VPS.
2. Ensure environment variables are set (BOT_TOKEN, API keys).
3. For persistent running, use a process manager:
   - Node.js: `pm2 start index.js --name frn-tg-v2`
   - Python: `pm2 --interpreter python3 start bot.py --name frn-tg-v2`
4. If using Docker, create a `Dockerfile` and push image to your registry then run on any host.

---

## Full list of existing command files (automatically detected)

- main.js
- scripts/cmds/adduser.js
- scripts/cmds/alldl.js
- scripts/cmds/choose.js
- scripts/cmds/echo.js
- scripts/cmds/file.js
- scripts/cmds/help.js
- scripts/cmds/link.js
- scripts/cmds/prefix.js
- scripts/cmds/q.js
- scripts/cmds/setphoto.js
- scripts/cmds/shell.js
- scripts/cmds/sing.js
- scripts/cmds/ssweb.js
- scripts/cmds/video.js

---

## Project folder structure (top 2 levels)

```
├── public
│   └── index.html
├── scripts
│   └── cmds
├── .replit
├── chatGroups.json
├── config.json
├── index.js
├── main.js
├── messageCount.json
├── package-lock.json
├── package.json
├── Procfile
├── README.md
├── update.js
├── vercel.json
└── version.txt
```

---

## Example usage

- Start the bot: `npm start` or `node index.js`
- Example command used in chat (if ping command implemented): `!ping` → bot replies `Pong!`

---

## Notes & next steps

- I replaced all mentions of `frnwot`, `frnwot`, and similar author mentions with `yourname`.
- I removed the original `.git` folder to make the project ready for you to initialize and push to your GitHub account.
- If you want, I can also create a GitHub repo and prepare a deployment script — but you'll need to provide access or do the final `git push` yourself.

---

### Contact

If anything is missing, open an issue in your repo or contact:

- GitHub: https://github.com/frnwot
- Email: frnbuid2005@gmail.com
- Telegram: @FARHAN_MUH_TASIM

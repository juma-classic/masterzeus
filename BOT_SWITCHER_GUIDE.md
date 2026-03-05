# Bot Switcher Guide

## Overview
The Bot Switcher automatically switches between two bots when a loss occurs, maintaining the same stake settings and automatically restarting the new bot.

## Features
- Monitors every trade in real-time
- Automatically switches to alternate bot on every loss
- Preserves stake settings across bot switches
- Auto-stops current bot, loads new bot, and auto-starts it
- Tracks statistics (total trades, switches, trades per bot)
- Manual switch option for testing

## How It Works

1. **Enable the Switcher**: Click "▶️ Enable Switcher" in the Bot Switcher tab
2. **Load Initial Bot**: The system starts with "Random LDP Differ - Elvis Trades"
3. **Run Your Bot**: Click RUN to start trading
4. **Automatic Switching**: When a loss occurs:
   - Bot automatically stops
   - System saves current stake
   - Loads alternate bot ("States Digit Switcher")
   - Restores stake to new bot
   - Automatically clicks RUN to continue trading
5. **Continuous Trading**: The process repeats, switching bots on every loss

## The Two Bots

### Bot 1: Random LDP Differ - Elvis Trades
- Primary bot for initial trading
- Located at: `public/Random LDP Differ - Elvis Trades.xml`

### Bot 2: States Digit Switcher
- Alternate bot used after losses
- Located at: `public/States Digit Switcher.xml`

## Usage Instructions

### Basic Setup
1. Navigate to the "Bot Switcher" tab
2. Click "▶️ Enable Switcher"
3. Go to Bot Builder and load your initial bot
4. Set your desired stake amount
5. Click RUN

### Monitoring
- Watch the Bot Switcher tab for real-time statistics
- Current bot name is displayed
- Total trades and switches are tracked
- Last switch time is shown

### Manual Control
- **Manual Switch**: Click "🔧 Manual Switch" to switch bots without waiting for a loss
- **Reset Stats**: Click "🔄 Reset Stats" to clear all statistics
- **Disable**: Click "⏸️ Disable Switcher" to stop automatic switching

## Statistics Tracked

- **Total Trades**: Combined trades from both bots
- **Bot 1 Trades**: Number of trades with Random LDP Differ
- **Bot 2 Trades**: Number of trades with States Digit Switcher
- **Switches**: Total number of bot switches
- **Last Switch**: Timestamp of most recent switch
- **Current Bot**: Which bot is currently active

## Important Notes

### Stake Preservation
- Your stake amount is automatically saved before switching
- The same stake is applied to the new bot
- No manual adjustment needed

### Automatic Restart
- After switching, the new bot automatically starts running
- No need to manually click RUN after each switch
- Trading continues seamlessly

### Loss Detection
- System monitors the `profit` field in contract data
- Any negative profit triggers a switch
- Switches happen immediately after contract closes

### Bot Loading
- Bots are loaded from the `public/` folder
- XML files must exist at the specified paths
- Bot workspace is cleared before loading new bot

## Troubleshooting

### Bot Not Switching
- Ensure "Enable Switcher" is active (green indicator)
- Check browser console for error messages
- Verify both XML files exist in `public/` folder
- Use "🧪 Test Events" button to verify event system

### Stake Not Preserved
- Check console logs for "💰 Saved stake" message
- Verify bot XML has a stake variable
- Ensure variable is named "Stake", "Initial Stake", or "Amount"

### Bot Not Auto-Starting
- Check console for "▶️ Auto-starting the new bot..." message
- Verify RUN button is available and not disabled
- Check for "✅ New bot started automatically" confirmation

## Console Logs

When functioning correctly, you'll see:
```
🔄 Bot Switcher ENABLED
🔔 Contract event received: {is_sold: true, profit: -1.00, ...}
📈 Trade completed: ❌ LOSS | Profit: -1.00
🔄 Loss detected! Triggering bot switch...
🔄 Switching from Random LDP Differ - Elvis Trades to States Digit Switcher
⏹️ Current bot stopped
💰 Saved stake: 1.00
📥 Loaded States Digit Switcher XML
✅ States Digit Switcher loaded via Blockly workspace
💰 Restored stake: 1.00
✅ Successfully switched to States Digit Switcher
▶️ Auto-starting the new bot...
✅ New bot started automatically
```

## Technical Details

### Event System
- Uses observer pattern from bot-skeleton
- Listens to `bot.contract` events
- Monitors `is_sold` and `profit` fields
- Triggers on `profit < 0`

### Bot Loading Methods
1. `load_modal.loadStrategyToBuilder()` (preferred)
2. Direct Blockly workspace manipulation
3. `updateWorkspaceName()` fallback

### Stop/Start Methods
1. `DBot.stopBot()` / `DBot.runBot()` (preferred)
2. Button click by ID: `db-animation__stop-button` / `db-animation__run-button`
3. Button click by test-id: `[data-testid="stop-button"]` / `[data-testid="run-button"]`
4. Button click by class: `.run-panel__button--stop` / `.run-panel__button--run`

## Files

- Service: `src/services/bot-switcher.service.ts`
- UI Component: `src/components/bot-switcher/BotSwitcher.tsx`
- Styles: `src/components/bot-switcher/BotSwitcher.scss`
- Bot 1 XML: `public/Random LDP Differ - Elvis Trades.xml`
- Bot 2 XML: `public/States Digit Switcher.xml`

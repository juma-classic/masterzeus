# Bot Switcher Debugging Guide

## Current Issue
The Bot Switcher is not detecting losses - contract events are not firing when trades complete.

## What We've Done

### 1. Enhanced Logging
Added comprehensive console logging throughout the bot-switcher service:
- Service initialization logs
- Observer availability checks
- Event registration confirmation
- Contract event reception logs
- Trade completion logs with profit/loss details

### 2. Added Test Event System
Created a `testEventSystem()` method that:
- Checks if observer is available
- Verifies event registration
- Emits test events to confirm the observer pattern works
- Can be triggered from the UI with the "🧪 Test Events" button

### 3. Multiple Event Listeners
The service now listens to:
- `bot.contract` - Main contract updates (emitted from OpenContract.js)
- `contract.status` - Contract status changes (purchase sent/received/sold)
- `bot.running` - When bot starts running
- `bot.stop` - When bot stops

## How to Debug

### Step 1: Open Browser Console
1. Open the site in your browser
2. Press F12 to open Developer Tools
3. Go to the Console tab

### Step 2: Navigate to Bot Switcher
1. Click on the "Bot Switcher" tab in the main navigation
2. You should see these logs:
   ```
   🎨 Bot Switcher UI component mounted
   📊 Service status: {...}
   ```

### Step 3: Check Service Initialization
Look for these logs in the console:
```
🔧 Bot Switcher Service initialized
🔍 Observer available: true
🔍 Observer type: object
✅ Test event received: {test: 'working'}
✅ Registered bot.contract listener
🔍 Is bot.contract registered? true
✅ Registered contract.status listener
🔍 Is contract.status registered? true
👂 Bot Switcher listening to contract events
```

If you DON'T see these logs, the service wasn't initialized properly.

### Step 4: Test the Event System
1. Click the "🧪 Test Events" button in the Bot Switcher UI
2. Check console for:
   ```
   🧪 Testing event system...
   🔍 Observer: Observer {...}
   🔍 Is bot.contract registered? true
   🧪 Emitting test bot.contract event...
   🔔 Contract event received: {is_sold: true, profit: -1.5, ...}
   ```

If you see the "🔔 Contract event received" log, the observer pattern IS working!

### Step 5: Enable the Switcher
1. Click "▶️ Enable Switcher" button
2. You should see:
   ```
   🔄 Bot Switcher ENABLED
   📊 Bot 1: Random LDP Differ - Elvis Trades
   📊 Bot 2: States Digit Switcher
   💡 Will switch to alternate bot on every loss
   ```

### Step 6: Run a Bot and Monitor Events
1. Go to the Bot Builder tab
2. Load a bot (Random LDP Differ - Elvis Trades.xml)
3. Click RUN
4. Watch the console for these events:
   ```
   🔔 bot.running event: ...
   🔔 Contract event received: {is_sold: false, ...}  (during trade)
   🔔 Contract event received: {is_sold: true, profit: -1.00, ...}  (after trade completes)
   📈 Trade completed: ❌ LOSS | Profit: -1.00
   🔄 Loss detected! Triggering bot switch...
   ```

## Expected Event Flow

When a trade completes:
1. `OpenContract.js` receives `proposal_open_contract` message from API
2. It calls `broadcastContract()` which emits `bot.contract` event
3. Bot Switcher's `onContractComplete()` receives the event
4. If `is_sold: true` and `profit < 0`, it triggers `switchBot()`
5. `switchBot()` stops the bot, loads new bot, preserves stake

## Troubleshooting

### If No Events Appear
**Problem**: No logs appear when running the bot
**Possible Causes**:
1. Service not initialized - check for initialization logs
2. Observer not available - check observer availability logs
3. Events not being emitted - check OpenContract.js is working

**Solution**: 
- Refresh the page and check initialization logs
- Use the Test Events button to verify observer works
- Check if other parts of the system (like run-panel-store) are receiving events

### If Test Events Work But Real Events Don't
**Problem**: Test button shows events working, but real trades don't trigger events
**Possible Causes**:
1. OpenContract.js not emitting events
2. Different observer instance being used
3. Events being emitted before service registers listeners

**Solution**:
- Check if run-panel-store is receiving bot.contract events (it should log them)
- Verify the observer import path is correct: `@/external/bot-skeleton`
- Try disabling and re-enabling the switcher after bot starts running

### If Events Fire But Bot Doesn't Switch
**Problem**: You see "🔔 Contract event received" but no switch happens
**Check**:
1. Is switcher enabled? Look for "🔄 Bot Switcher ENABLED"
2. Is `is_sold: true` in the contract event?
3. Is `profit < 0` (negative)?
4. Is `isProcessing: false`?

**Solution**:
- Make sure you clicked "Enable Switcher"
- Wait for trade to fully complete (is_sold must be true)
- Check the full contract object in the logs

### If Bot Doesn't Stop After Switch
**Problem**: Switch happens but bot keeps running
**Possible Causes**:
1. Stop button not found
2. DBot.stopBot() not available
3. Button is disabled

**Solution**:
- Check logs for "⏹️ Bot stopped via..." message
- If you see "⚠️ Could not find method to stop bot", the stop mechanism failed
- Try manually clicking stop button to verify it works

## Key Files

- `src/services/bot-switcher.service.ts` - Main service logic
- `src/components/bot-switcher/BotSwitcher.tsx` - UI component
- `src/external/bot-skeleton/services/tradeEngine/trade/OpenContract.js` - Where events are emitted
- `src/external/bot-skeleton/utils/observer.js` - Observer pattern implementation
- `src/stores/run-panel-store.ts` - Another component that listens to same events

## Next Steps

Based on console logs, we can determine:
1. Is the service initializing?
2. Is the observer pattern working?
3. Are events being emitted?
4. Are events being received?
5. Is the switch logic executing?

Once we identify which step is failing, we can fix it specifically.

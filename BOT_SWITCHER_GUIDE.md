# Bot Switcher - Automatic Bot Switching on Loss

## Overview
The Bot Switcher automatically switches between two trading bots when a loss occurs. This feature helps diversify your trading strategy by alternating between different bot approaches while maintaining the same stake settings.

## How It Works

1. **Start with Bot 1**: Random LDP Differ - Elvis Trades.xml
2. **On Loss**: Automatically switches to Bot 2 (States Digit Switcher.xml)
3. **On Next Loss**: Switches back to Bot 1
4. **Continues**: Alternates between bots on every loss

## Key Features

- ✅ **Automatic Switching**: No manual intervention needed
- ✅ **Stake Preservation**: Your stake settings are maintained across bot switches
- ✅ **Real-time Stats**: Track switches, trades per bot, and performance
- ✅ **Manual Control**: Enable/disable switcher anytime
- ✅ **Manual Switch**: Test the switching mechanism manually

## How to Use

### Step 1: Access Bot Switcher
1. Open ZEUS TRADING platform
2. Navigate to the **Bot Switcher** tab (next to Bot Builder)

### Step 2: Enable the Switcher
1. Click the **"▶️ Enable Switcher"** button
2. The status indicator will turn green showing "ACTIVE"
3. You'll see confirmation in the console

### Step 3: Start Trading
1. Go to the **Bot Builder** tab
2. Load your first bot (Random LDP Differ - Elvis Trades.xml)
3. Set your desired stake amount
4. Click **Run** to start trading

### Step 4: Monitor Performance
The Bot Switcher tab shows:
- **Currently Active Bot**: Which bot is running
- **Total Trades**: Combined trades from both bots
- **Switches**: Number of times bots have been switched
- **Bot 1 Trades**: Trades executed by Random LDP Differ
- **Bot 2 Trades**: Trades executed by States Digit Switcher
- **Last Switch**: Timestamp of the most recent switch

## Bot Configuration

### Bot 1: Random LDP Differ - Elvis Trades
- **File**: `Random LDP Differ - Elvis Trades.xml`
- **Strategy**: Matches/Differs with LDP (Last Digit Prediction)
- **Market**: Synthetic Index (R_10)

### Bot 2: States Digit Switcher
- **File**: `States Digit Switcher.xml`
- **Strategy**: Over/Under digit prediction with state analysis
- **Market**: Synthetic Index

## Controls

### Enable/Disable Switcher
- **Enable**: Activates automatic bot switching on loss
- **Disable**: Stops automatic switching (current bot continues)

### Reset Stats
- Clears all statistics (trades, switches, etc.)
- Does not affect current trading session

### Manual Switch
- Manually trigger a bot switch for testing
- Only works when switcher is enabled
- Useful for testing the switching mechanism

## Technical Details

### How Switching Works
1. **Loss Detection**: Monitors contract completion events
2. **Bot Stop**: Stops the currently running bot
3. **Stake Save**: Saves the current stake amount
4. **Bot Load**: Loads the alternate bot XML
5. **Stake Restore**: Applies the saved stake to the new bot
6. **Bot Start**: Starts the new bot automatically

### Timing
- **Stop Delay**: 500ms to ensure clean bot stop
- **Start Delay**: 500ms before starting new bot
- **Total Switch Time**: ~1-2 seconds

### Stake Variables
The system looks for these stake variable names:
- `Stake`
- `Initial Stake`
- `Amount`

## Important Notes

⚠️ **Before Using**:
1. Ensure both bot XML files exist in the `public/` folder
2. Test with small stakes first
3. Monitor the first few switches to ensure smooth operation

⚠️ **During Trading**:
1. Don't manually stop/start bots while switcher is active
2. Let the switcher handle all bot transitions
3. Check the console for detailed switching logs

⚠️ **Best Practices**:
1. Start with the switcher disabled
2. Run a few trades manually to verify both bots work
3. Enable switcher once you're comfortable
4. Monitor performance regularly

## Troubleshooting

### Switcher Not Working
- Check if switcher is enabled (green status indicator)
- Verify both bot XML files exist
- Check browser console for error messages

### Bot Not Switching
- Ensure a loss occurred (profit < 0)
- Check if bot is actually running
- Verify `load_modal.loadStrategyToBuilder` is available

### Stake Not Preserved
- Check if stake variable exists in both bots
- Verify variable names match (Stake, Initial Stake, Amount)
- Look for console messages about stake save/restore

## Console Messages

The Bot Switcher logs detailed information:

```
🔄 Bot Switcher ENABLED
📊 Bot 1: Random LDP Differ - Elvis Trades
📊 Bot 2: States Digit Switcher
💡 Will switch to alternate bot on every loss

📈 Trade completed: ❌ LOSS | Profit: $-5.00
🔄 Switching from Random LDP Differ - Elvis Trades to States Digit Switcher
⏹️ Current bot stopped
💰 Saved stake: $10
📥 Loaded States Digit Switcher XML
✅ States Digit Switcher loaded into builder
💰 Restored stake: $10
▶️ New bot started
✅ Successfully switched to States Digit Switcher
📊 Total switches: 1
```

## Files Created

1. **Service**: `src/services/bot-switcher.service.ts`
   - Core switching logic
   - Contract monitoring
   - Stake management

2. **Component**: `src/components/bot-switcher/BotSwitcher.tsx`
   - UI interface
   - Stats display
   - Controls

3. **Styles**: `src/components/bot-switcher/BotSwitcher.scss`
   - Component styling
   - Animations
   - Responsive design

4. **Integration**: `src/pages/main/main.tsx`
   - Added Bot Switcher tab
   - Icon and navigation

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify both bot XML files are accessible
3. Ensure you're using the latest version
4. Test with manual switch first

## Future Enhancements

Potential improvements:
- Support for more than 2 bots
- Custom switching conditions (e.g., after X consecutive losses)
- Different stake strategies per bot
- Performance analytics and recommendations
- Bot selection UI for choosing which bots to alternate

---

**Created for ZEUS TRADING Platform**
**Version**: 1.0.0
**Last Updated**: 2024

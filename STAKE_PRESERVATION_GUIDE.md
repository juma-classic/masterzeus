# Stake Preservation in Bot Switcher

## How It Works

The Bot Switcher automatically preserves your stake amount when switching between bots. This ensures consistent risk management across both strategies.

## Implementation

### Step 1: Save Stake (Before Switch)
When switching bots, the system saves the current stake from Bot 1:

**Locations Checked:**
1. **Variables** - Looks for variables named:
   - `Stake`
   - `Initial Stake`
   - `Amount`

2. **Trade Options Block** - Checks `trade_definition_tradeoptions` block's AMOUNT field

3. **Multiplier Block** - Checks `trade_definition_multiplier` block's AMOUNT field

### Step 2: Load New Bot
The new bot XML is loaded into the workspace, clearing the previous bot's blocks.

### Step 3: Restore Stake (After Switch)
The saved stake is applied to Bot 2 in the same locations:

1. Searches for stake variables in the new bot
2. Updates the math_number block with the saved stake value
3. Logs the restored stake amount

## Console Logs

Watch for these messages in the browser console:

```
💰 Saved stake: $5.00
📥 Loading Bot 2 XML
✅ Bot 2 loaded successfully
💰 Restored stake: $5.00
```

## Example Scenario

```
Bot 1 Configuration:
- Stake: $5.00
- Strategy: Random LDP Differ

↓ Loss occurs, trigger activated

Bot 2 Configuration:
- Stake: $5.00 (automatically copied from Bot 1)
- Strategy: States Digit Switcher

↓ Win occurs, recovery complete

Bot 1 Configuration:
- Stake: $5.00 (automatically copied from Bot 2)
- Strategy: Random LDP Differ
```

## Important Notes

1. **Stake is preserved in BOTH directions**:
   - Bot 1 → Bot 2: ✓
   - Bot 2 → Bot 1: ✓

2. **Works with all stake types**:
   - Fixed stake amounts
   - Variable-based stakes
   - Multiplier amounts

3. **Automatic Updates**:
   - No manual intervention needed
   - Stake is saved before stopping the bot
   - Stake is restored after loading the new bot

4. **Fallback Behavior**:
   - If stake cannot be found, logs a warning
   - Bot will use whatever stake is defined in its XML
   - Check console for "⚠️ Could not find stake value" messages

## Troubleshooting

### Stake Not Preserving?

1. **Check Console Logs**:
   - Look for "💰 Saved stake" message
   - Look for "💰 Restored stake" message
   - Check for any error messages

2. **Verify Bot Structure**:
   - Ensure both bots use the same stake variable name
   - Check that stake is defined in a supported location
   - Verify the stake block is a `math_number` type

3. **Common Issues**:
   - **Different variable names**: Bot 1 uses "Stake", Bot 2 uses "Amount"
     - Solution: Use the same variable name in both bots
   
   - **Stake in unsupported location**: Custom stake calculation
     - Solution: Use standard stake variables or trade option blocks
   
   - **Stake is a formula**: Stake = Balance * 0.01
     - Solution: The formula will be preserved, but the base value updates

## Testing

To verify stake preservation is working:

1. Set Bot 1 stake to a specific amount (e.g., $7.50)
2. Enable Bot Switcher
3. Trigger a switch (loss/win/threshold)
4. Check Bot 2's stake in the workspace
5. Verify it matches Bot 1's stake ($7.50)

## Technical Details

**Code Location**: `src/services/bot-switcher.service.ts`

**Methods**:
- `saveCurrentStake()` - Lines ~514-545
- `restoreStake()` - Lines ~643-670

**Execution Order**:
1. `onContractComplete()` - Detects trigger
2. `switchBot()` - Orchestrates the switch
3. `stopCurrentBot()` - Stops Bot 1
4. `saveCurrentStake()` - Saves stake
5. `loadBot()` - Loads Bot 2
6. `restoreStake()` - Applies saved stake
7. `startBot()` - Starts Bot 2

## Summary

✅ Stake preservation is **automatic**
✅ Works in **both directions**
✅ Supports **multiple stake types**
✅ **No configuration needed**
✅ **Logs all actions** for transparency

Your stake amount will always be consistent across bot switches!

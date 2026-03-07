# Bot 2 Specific Features

## Overview

Bot 2 now has specific features that only apply when Bot 2 is active. This allows for more sophisticated trading strategies where Bot 1 is your main strategy and Bot 2 is your recovery/backup strategy.

## Feature: Switch on Win (Bot 2 Only)

### What It Does

The "Switch on Win" trigger now only activates when Bot 2 wins a trade. This means:

- ✅ **Bot 2 wins** → Switches back to Bot 1
- ❌ **Bot 1 wins** → No switch (continues with Bot 1)

### Why This Makes Sense

This feature is designed for a common trading pattern:

1. **Bot 1** = Your main trading strategy (runs most of the time)
2. **Bot 2** = Your recovery strategy (only runs after losses)

When Bot 2 successfully recovers from a loss, you want to return to your main strategy (Bot 1).

### How It Works

```typescript
// In checkSwitchTriggers()
if (this.switchTrigger.onWin && isWin && this.currentBot === 'bot2') {
    triggers.push('Win detected (Bot 2 only)');
}
```

The switch only happens if:
1. "Switch on Win" is enabled
2. The trade was a win
3. **Bot 2 is currently active** ← This is the key difference

### UI Changes

1. **Checkbox Label Updated**
   - Before: "Switch on Win"
   - After: "Switch on Win (Bot 2 only)"

2. **Info Message Added**
   - Shows: "💡 Note: 'Switch on Win' only triggers when Bot 2 wins (returns to Bot 1)"
   - Styled with yellow accent to draw attention

### Use Cases

#### Use Case 1: Basic Recovery Strategy
```
Bot 1: Conservative strategy with small stakes
Bot 2: Aggressive recovery with higher stakes

Flow:
1. Bot 1 loses → Switch to Bot 2
2. Bot 2 wins → Switch back to Bot 1 ✅
3. Continue with Bot 1
```

#### Use Case 2: Martingale Recovery
```
Bot 1: Fixed stake strategy
Bot 2: Martingale strategy (doubles stake on loss)

Flow:
1. Bot 1 loses → Switch to Bot 2
2. Bot 2 runs martingale until win
3. Bot 2 wins → Switch back to Bot 1 ✅
4. Reset to fixed stake with Bot 1
```

#### Use Case 3: Market Condition Switch
```
Bot 1: Trend-following strategy
Bot 2: Range-bound strategy

Flow:
1. Bot 1 loses (trend breaks) → Switch to Bot 2
2. Bot 2 wins (range confirmed) → Switch back to Bot 1 ✅
3. Try trend-following again
```

### Comparison with Auto-Return Feature

You might notice this is similar to the existing "Auto-Return" feature. Here's the difference:

| Feature | Auto-Return | Switch on Win (Bot 2 Only) |
|---------|-------------|---------------------------|
| **Always Active** | Yes (can't disable) | No (optional checkbox) |
| **Trigger** | ANY win by Bot 2 | ANY win by Bot 2 |
| **Purpose** | Built-in safety | User-configurable trigger |
| **Can Combine** | Yes | Yes (both will trigger) |

**Note:** Currently, both features do the same thing. The difference is:
- Auto-Return is always on (safety feature)
- Switch on Win is optional (user choice)

In the future, Auto-Return could be enhanced to only trigger after recovering losses, while Switch on Win would trigger on any win.

### Configuration Example

```typescript
// Enable switch on win for Bot 2
botSwitcherService.setSwitchTrigger({
    onLoss: true,           // Switch to Bot 2 on any loss
    onWin: true,            // Switch back to Bot 1 when Bot 2 wins
    autoReturnToBot1: true  // Also auto-return (redundant but safe)
});
```

### Code Changes

#### Service (bot-switcher.service.ts)
```typescript
private checkSwitchTriggers(isLoss: boolean, isWin: boolean): boolean {
    // ... other triggers

    // Switch on Win only works for Bot 2
    if (this.switchTrigger.onWin && isWin && this.currentBot === 'bot2') {
        triggers.push('Win detected (Bot 2 only)');
    }

    // ... rest of triggers
}
```

#### UI (BotSwitcher.tsx)
```tsx
<span>Switch on Win (Bot 2 only)</span>
```

#### Styles (BotSwitcher.scss)
```scss
&__triggers-info {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 193, 7, 0.15);
    border-left: 3px solid #ffc107;
    padding: 10px 12px;
    margin-bottom: 16px;
    border-radius: 6px;
}
```

## Future Bot 2 Specific Features

Here are other features that could be added specifically for Bot 2:

### 1. Custom Stake Multiplier
```typescript
bot2StakeMultiplier: 2.0  // Bot 2 uses 2x the stake
```

### 2. Max Trades Limit
```typescript
bot2MaxTrades: 5  // Bot 2 stops after 5 trades
```

### 3. Time Limit
```typescript
bot2MaxDuration: 300  // Bot 2 runs max 5 minutes
```

### 4. Loss Limit
```typescript
bot2MaxLoss: 50  // Bot 2 stops if losses exceed $50
```

### 5. Different Contract Settings
```typescript
bot2ContractType: 'DIGITDIFF'  // Bot 2 uses different contract
bot2Duration: 5  // Bot 2 uses 5 ticks instead of Bot 1's duration
```

## Testing Checklist

- [x] Switch on Win only triggers for Bot 2
- [x] Switch on Win does NOT trigger for Bot 1
- [x] UI label updated to show "Bot 2 only"
- [x] Info message displays correctly
- [x] Styling looks good
- [ ] Test with real trades
- [ ] Verify Bot 1 wins don't trigger switch
- [ ] Verify Bot 2 wins do trigger switch

## Summary

The "Switch on Win" feature is now Bot 2 specific, making it perfect for recovery strategies where you want to return to your main bot (Bot 1) after Bot 2 successfully recovers from a loss.

This is the first of many potential Bot 2 specific features that can make your trading strategies more sophisticated and flexible! 🚀

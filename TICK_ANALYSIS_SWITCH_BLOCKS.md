# Tick Analysis Switch Blocks - Complete Implementation

## Overview
Added 8 new Blockly blocks for switching bots based on tick analysis parameters. These blocks appear in the "Restart trading conditions" category and allow sophisticated bot switching strategies based on digit patterns and tick behavior.

## New Blocks Implemented

### 1. Switch Bot on Digit Condition
**File**: `switch_bot_on_digit_condition.js`
**Purpose**: Switch based on digit patterns in last N ticks
**Parameters**:
- Bot Name (string)
- Digit Count (number) - how many digits to analyze
- Condition (dropdown):
  - All Even
  - All Odd
  - All Same
  - All Rising
  - All Falling
  - Match Pattern
- Pattern (string) - for match pattern condition

**Example**: Switch to "Pattern Bot.xml" when last 5 digits are all even

### 2. Switch Bot on Even/Odd Percentage
**File**: `switch_bot_on_even_odd.js`
**Purpose**: Switch when X% of last N ticks are even or odd
**Parameters**:
- Bot Name (string)
- Percentage (number) - threshold percentage
- Tick Count (number) - how many ticks to analyze
- Type (dropdown): Even or Odd

**Example**: Switch when 70% of last 10 ticks are even

### 3. Switch Bot on Over/Under Analysis
**File**: `switch_bot_on_over_under.js`
**Purpose**: Switch when X% of ticks are over/under a threshold
**Parameters**:
- Bot Name (string)
- Percentage (number) - threshold percentage
- Tick Count (number) - how many ticks to analyze
- Comparison (dropdown): Over or Under
- Threshold (number) - the value to compare against

**Example**: Switch when 60% of last 10 ticks are over 5

### 4. Switch Bot on Match/Differ Analysis
**File**: `switch_bot_on_match_differ.js`
**Purpose**: Switch based on consecutive tick matching/differing
**Parameters**:
- Bot Name (string)
- Percentage (number) - threshold percentage
- Tick Count (number) - how many ticks to analyze
- Type (dropdown): Match or Differ

**Example**: Switch when 60% of consecutive ticks match

### 5. Switch Bot on Rise/Fall Percentage
**File**: `switch_bot_on_rise_fall.js`
**Purpose**: Switch based on rising/falling tick trends
**Parameters**:
- Bot Name (string)
- Percentage (number) - threshold percentage
- Tick Count (number) - how many ticks to analyze
- Direction (dropdown): Rising or Falling

**Example**: Switch when 60% of last 10 ticks are rising

### 6. Switch Bot on Last Digit
**File**: `switch_bot_on_last_digit.js`
**Purpose**: Switch based on the most recent tick digit
**Parameters**:
- Bot Name (string)
- Comparison (dropdown):
  - Equals
  - Not Equals
  - Greater Than
  - Less Than
  - Is Even
  - Is Odd
- Value (number) - comparison value

**Example**: Switch when last digit equals 7

### 7. Switch Bot on Nth Last Digit
**File**: `switch_bot_on_nth_digit.js`
**Purpose**: Switch based on a specific position in recent digits
**Parameters**:
- Bot Name (string)
- Position (number) - 1 = last, 2 = second last, etc.
- Comparison (dropdown):
  - Equals
  - Not Equals
  - Greater Than
  - Less Than
  - Is Even
  - Is Odd
- Value (number) - comparison value

**Example**: Switch when 2nd last digit is greater than 5

### 8. Switch Bot on Digit Frequency
**File**: `switch_bot_on_digit_frequency.js`
**Purpose**: Switch based on how often a digit appears
**Parameters**:
- Bot Name (string)
- Digit (number) - the digit to count (0-9)
- Comparison (dropdown):
  - Exactly
  - More Than
  - Less Than
  - At Least
  - At Most
- Count (number) - frequency threshold
- Tick Count (number) - how many ticks to analyze

**Example**: Switch when digit 7 appears more than 3 times in last 10 ticks

## Required Bot Helper Methods

These blocks rely on Bot helper methods that need to be implemented:

```javascript
Bot.getLastDigit() // Returns the last tick digit
Bot.getLastNDigits(n) // Returns array of last N tick digits
Bot.getNthLastDigit(n) // Returns the Nth last digit (1=last, 2=second last)
Bot.stop() // Stops the current bot
Bot.loadStrategy(filename) // Loads a bot XML file
Bot.start() // Starts the bot
Bot.getLastProfit() // Returns profit/loss from last trade
Bot.setMarket(market) // Changes the trading market
```

## Integration

### Files Modified:
1. **`src/external/bot-skeleton/scratch/blocks/Binary/After Purchase/index.js`**
   - Added imports for all 8 new blocks

2. **`src/pages/bot-builder/toolbox/toolbox-items.tsx`**
   - Added all 8 blocks to "Restart trading conditions" category with default values

### Files Created:
1. `switch_bot_on_digit_condition.js`
2. `switch_bot_on_even_odd.js`
3. `switch_bot_on_over_under.js`
4. `switch_bot_on_match_differ.js`
5. `switch_bot_on_nth_digit.js`
6. `switch_bot_on_rise_fall.js`
7. `switch_bot_on_last_digit.js`
8. `switch_bot_on_digit_frequency.js`

## Usage in Bot Builder

All blocks appear in the visual bot builder under:
**"Restart trading conditions"** category

They can be dragged into the "After Purchase" block to execute after each trade completes.

## Block Behavior

- All blocks check if they're inside an "after_purchase" block
- Blocks are disabled if placed outside the correct context
- Each block generates JavaScript code that:
  1. Analyzes tick data based on the condition
  2. Logs the decision to console
  3. Stops the current bot if condition is met
  4. Loads the new bot strategy
  5. Starts the new bot automatically

## Color Scheme

All blocks use the Special1 color scheme:
- Primary: Special1.colour
- Secondary: Special1.colourSecondary
- Tertiary: Special1.colourTertiary

This matches the existing switch blocks for visual consistency.

## Next Steps

To fully implement these blocks, you need to:

1. Implement the Bot helper methods in the bot runtime
2. Test each block in the bot builder interface
3. Verify tick data is accessible during "after_purchase" execution
4. Add error handling for missing bot files
5. Consider adding validation for bot file names
6. Test bot switching with stake preservation

## Notes

- All blocks preserve stake settings when switching (handled by Bot.loadStrategy)
- Bot auto-restarts after switching (no manual RUN click needed)
- Console logging helps debug switching behavior
- Blocks use localization for multi-language support

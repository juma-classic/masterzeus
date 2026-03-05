# Tick Analysis Blocks - Complete Implementation

## Overview
Added 7 new Blockly analysis blocks that return boolean values (true/false) for use in conditions. These blocks appear in the "Tick and candle analysis" category and allow sophisticated trading logic based on digit patterns and tick behavior.

## New Analysis Blocks Implemented

### 1. Digit Pattern Condition
**File**: `digit_condition.js`
**Purpose**: Check if last N digits match specific patterns
**Returns**: Boolean (true/false)
**Parameters**:
- Digit Count (number) - how many digits to analyze
- Condition (dropdown):
  - All Even
  - All Odd
  - All Same
  - All Rising
  - All Falling
  - Match Pattern
- Pattern (string) - for match pattern condition

**Example Usage**: Use in IF block to check if last 5 digits are all even

### 2. Even/Odd Percentage
**File**: `even_odd_percentage.js`
**Purpose**: Check if X% of last N ticks are even or odd
**Returns**: Boolean (true/false)
**Parameters**:
- Percentage (number) - threshold percentage
- Tick Count (number) - how many ticks to analyze
- Type (dropdown): Even or Odd

**Example Usage**: Returns true when 70% of last 10 ticks are even

### 3. Over/Under Percentage
**File**: `over_under_percentage.js`
**Purpose**: Check if X% of ticks are over/under a threshold
**Returns**: Boolean (true/false)
**Parameters**:
- Percentage (number) - threshold percentage
- Tick Count (number) - how many ticks to analyze
- Comparison (dropdown): Over or Under
- Threshold (number) - the value to compare against

**Example Usage**: Returns true when 60% of last 10 ticks are over 5

### 4. Match/Differ Percentage
**File**: `match_differ_percentage.js`
**Purpose**: Check if consecutive ticks match/differ at certain rate
**Returns**: Boolean (true/false)
**Parameters**:
- Percentage (number) - threshold percentage
- Tick Count (number) - how many ticks to analyze
- Type (dropdown): Match or Differ

**Example Usage**: Returns true when 60% of consecutive ticks match

### 5. Rise/Fall Percentage
**File**: `rise_fall_percentage.js`
**Purpose**: Check if ticks are rising/falling at certain rate
**Returns**: Boolean (true/false)
**Parameters**:
- Percentage (number) - threshold percentage
- Tick Count (number) - how many ticks to analyze
- Direction (dropdown): Rising or Falling

**Example Usage**: Returns true when 60% of last 10 ticks are rising

### 6. Nth Last Digit Check
**File**: `nth_digit_check.js`
**Purpose**: Check a specific position in recent digits
**Returns**: Boolean (true/false)
**Parameters**:
- Position (number) - 1 = last, 2 = second last, etc.
- Comparison (dropdown):
  - Equals
  - Not Equals
  - Greater Than
  - Less Than
  - Is Even
  - Is Odd
- Value (number) - comparison value

**Example Usage**: Returns true when 2nd last digit is greater than 5

### 7. Digit Frequency Check
**File**: `digit_frequency_check.js`
**Purpose**: Check how often a digit appears
**Returns**: Boolean (true/false)
**Parameters**:
- Digit (number) - the digit to count (0-9)
- Comparison (dropdown):
  - Exactly
  - More Than
  - Less Than
  - At Least
  - At Most
- Count (number) - frequency threshold
- Tick Count (number) - how many ticks to analyze

**Example Usage**: Returns true when digit 7 appears more than 3 times in last 10 ticks

## How to Use These Blocks

These are analysis blocks that return true/false values. Use them in:

1. **IF conditions** - Make decisions based on tick patterns
2. **Purchase conditions** - Decide when to enter trades
3. **Sell conditions** - Decide when to exit trades
4. **Combined with logic blocks** - Create complex strategies using AND/OR

### Example Strategy:
```
IF (70% of last 10 ticks are even) AND (last digit equals 2)
THEN purchase RISE
```

## Required Bot Helper Methods

These blocks rely on Bot helper methods:

```javascript
Bot.getLastNDigits(n) // Returns array of last N tick digits
Bot.getNthLastDigit(n) // Returns the Nth last digit (1=last, 2=second last)
```

## Integration

### Files Modified:
1. **`src/external/bot-skeleton/scratch/blocks/Binary/Tick Analysis/index.js`**
   - Added imports for all 7 new analysis blocks

2. **`src/pages/bot-builder/toolbox/toolbox-items.tsx`**
   - Added all 7 blocks to "Tick and candle analysis" category with default values

### Files Created:
1. `digit_condition.js`
2. `even_odd_percentage.js`
3. `over_under_percentage.js`
4. `match_differ_percentage.js`
5. `rise_fall_percentage.js`
6. `nth_digit_check.js`
7. `digit_frequency_check.js`

### Files Removed:
- Removed 8 old auto-switch blocks from After Purchase folder
- These were replaced with analysis logic blocks

## Usage in Bot Builder

All blocks appear in the visual bot builder under:
**"Tick and candle analysis"** category

They return boolean values and can be used anywhere a true/false condition is needed.

## Block Behavior

- All blocks return Boolean output (true/false)
- Use round output shape (standard for boolean blocks)
- Can be connected to IF blocks, logic blocks, or any condition input
- Each block generates JavaScript code that evaluates the condition and returns the result

## Color Scheme

All blocks use the Base color scheme:
- Primary: Base.colour
- Secondary: Base.colourSecondary
- Tertiary: Base.colourTertiary

This matches other analysis blocks like `check_direction` for visual consistency.

## Combining with Switch Blocks

You can combine these analysis blocks with the existing switch blocks:

**Example**:
```
After Purchase:
  IF (70% of last 10 ticks are even)
    THEN Switch to bot "Even Strategy.xml"
  ELSE IF (digit 7 appears more than 3 times)
    THEN Switch to bot "Lucky 7 Strategy.xml"
```

## Notes

- All blocks use localization for multi-language support
- Blocks follow Blockly best practices for boolean outputs
- Console logging can be added for debugging if needed
- Blocks are optimized for performance with inline function execution

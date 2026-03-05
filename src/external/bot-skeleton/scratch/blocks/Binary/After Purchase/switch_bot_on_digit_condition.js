import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.switch_bot_on_digit_condition = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Switch to bot %1 when last %2 digits %3 %4'),
            args0: [
                {
                    type: 'input_value',
                    name: 'BOT_NAME',
                    check: 'String',
                },
                {
                    type: 'input_value',
                    name: 'DIGIT_COUNT',
                    check: 'Number',
                },
                {
                    type: 'field_dropdown',
                    name: 'CONDITION',
                    options: [
                        [localize('are all even'), 'all_even'],
                        [localize('are all odd'), 'all_odd'],
                        [localize('are all same'), 'all_same'],
                        [localize('are all rising'), 'all_rising'],
                        [localize('are all falling'), 'all_falling'],
                        [localize('match pattern'), 'match_pattern'],
                    ],
                },
                {
                    type: 'input_value',
                    name: 'PATTERN',
                    check: 'String',
                },
            ],
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            tooltip: localize(
                'Switch to a different bot based on digit patterns in the last N ticks. Useful for pattern-based strategies.'
            ),
            category: window.Blockly.Categories.After_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Switch bot on digit condition'),
            description: localize(
                'Switches to a different bot when specific digit patterns are detected in recent ticks.'
            ),
        };
    },
    onchange(event) {
        if (!this.workspace || this.isInFlyout || this.workspace.isDragging()) {
            return;
        }

        const top_parent = this.getTopParent();
        if (top_parent && top_parent.type !== 'after_purchase') {
            this.setDisabled(true);
        } else {
            this.setDisabled(false);
        }
    },
};

window.Blockly.JavaScript.switch_bot_on_digit_condition = block => {
    const bot_name = window.Blockly.JavaScript.valueToCode(block, 'BOT_NAME', window.Blockly.JavaScript.ORDER_ATOMIC) || '""';
    const digit_count = window.Blockly.JavaScript.valueToCode(block, 'DIGIT_COUNT', window.Blockly.JavaScript.ORDER_ATOMIC) || '5';
    const condition = block.getFieldValue('CONDITION');
    const pattern = window.Blockly.JavaScript.valueToCode(block, 'PATTERN', window.Blockly.JavaScript.ORDER_ATOMIC) || '""';
    
    const code = `
    (function() {
        const lastDigits = Bot.getLastNDigits(${digit_count});
        let shouldSwitch = false;
        
        switch('${condition}') {
            case 'all_even':
                shouldSwitch = lastDigits.every(d => d % 2 === 0);
                break;
            case 'all_odd':
                shouldSwitch = lastDigits.every(d => d % 2 !== 0);
                break;
            case 'all_same':
                shouldSwitch = lastDigits.every(d => d === lastDigits[0]);
                break;
            case 'all_rising':
                shouldSwitch = lastDigits.every((d, i) => i === 0 || d > lastDigits[i-1]);
                break;
            case 'all_falling':
                shouldSwitch = lastDigits.every((d, i) => i === 0 || d < lastDigits[i-1]);
                break;
            case 'match_pattern':
                shouldSwitch = lastDigits.join('') === ${pattern}.toString();
                break;
        }
        
        if (shouldSwitch) {
            console.log('🔄 Digit condition met, switching to bot: ' + ${bot_name});
            Bot.stop();
            Bot.loadStrategy(${bot_name});
            Bot.start();
        }
    })();
    `;
    
    return code;
};

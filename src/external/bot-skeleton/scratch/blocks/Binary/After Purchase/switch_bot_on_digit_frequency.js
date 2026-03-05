import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.switch_bot_on_digit_frequency = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Switch to bot %1 when digit %2 appears %3 %4 times in last %5 ticks'),
            args0: [
                {
                    type: 'input_value',
                    name: 'BOT_NAME',
                    check: 'String',
                },
                {
                    type: 'input_value',
                    name: 'DIGIT',
                    check: 'Number',
                },
                {
                    type: 'field_dropdown',
                    name: 'COMPARISON',
                    options: [
                        [localize('exactly'), 'equals'],
                        [localize('more than'), 'greater'],
                        [localize('less than'), 'less'],
                        [localize('at least'), 'greater_equal'],
                        [localize('at most'), 'less_equal'],
                    ],
                },
                {
                    type: 'input_value',
                    name: 'COUNT',
                    check: 'Number',
                },
                {
                    type: 'input_value',
                    name: 'TICK_COUNT',
                    check: 'Number',
                },
            ],
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            tooltip: localize(
                'Switch bot based on how often a specific digit appears. Example: Switch when digit 7 appears more than 3 times in last 10 ticks.'
            ),
            category: window.Blockly.Categories.After_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Switch bot on digit frequency'),
            description: localize(
                'Switches to a different bot based on the frequency of a specific digit in recent ticks.'
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

window.Blockly.JavaScript.switch_bot_on_digit_frequency = block => {
    const bot_name = window.Blockly.JavaScript.valueToCode(block, 'BOT_NAME', window.Blockly.JavaScript.ORDER_ATOMIC) || '""';
    const digit = window.Blockly.JavaScript.valueToCode(block, 'DIGIT', window.Blockly.JavaScript.ORDER_ATOMIC) || '5';
    const comparison = block.getFieldValue('COMPARISON');
    const count = window.Blockly.JavaScript.valueToCode(block, 'COUNT', window.Blockly.JavaScript.ORDER_ATOMIC) || '3';
    const tick_count = window.Blockly.JavaScript.valueToCode(block, 'TICK_COUNT', window.Blockly.JavaScript.ORDER_ATOMIC) || '10';
    
    const code = `
    (function() {
        const lastDigits = Bot.getLastNDigits(${tick_count});
        const frequency = lastDigits.filter(d => d === ${digit}).length;
        let shouldSwitch = false;
        
        switch('${comparison}') {
            case 'equals':
                shouldSwitch = frequency === ${count};
                break;
            case 'greater':
                shouldSwitch = frequency > ${count};
                break;
            case 'less':
                shouldSwitch = frequency < ${count};
                break;
            case 'greater_equal':
                shouldSwitch = frequency >= ${count};
                break;
            case 'less_equal':
                shouldSwitch = frequency <= ${count};
                break;
        }
        
        if (shouldSwitch) {
            console.log('🔄 Digit ${digit} frequency ('+frequency+') condition met, switching to bot: ' + ${bot_name});
            Bot.stop();
            Bot.loadStrategy(${bot_name});
            Bot.start();
        }
    })();
    `;
    
    return code;
};

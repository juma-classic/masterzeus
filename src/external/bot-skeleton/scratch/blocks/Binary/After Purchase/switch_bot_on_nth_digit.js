import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.switch_bot_on_nth_digit = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Switch to bot %1 when %2 last digit is %3 %4'),
            args0: [
                {
                    type: 'input_value',
                    name: 'BOT_NAME',
                    check: 'String',
                },
                {
                    type: 'input_value',
                    name: 'POSITION',
                    check: 'Number',
                },
                {
                    type: 'field_dropdown',
                    name: 'COMPARISON',
                    options: [
                        [localize('equals'), 'equals'],
                        [localize('not equals'), 'not_equals'],
                        [localize('greater than'), 'greater'],
                        [localize('less than'), 'less'],
                        [localize('is even'), 'even'],
                        [localize('is odd'), 'odd'],
                    ],
                },
                {
                    type: 'input_value',
                    name: 'VALUE',
                    check: 'Number',
                },
            ],
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            tooltip: localize(
                'Switch bot based on the Nth last digit. Position 1 = last digit, 2 = second last, etc.'
            ),
            category: window.Blockly.Categories.After_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Switch bot on Nth last digit'),
            description: localize(
                'Switches to a different bot based on a specific position in recent tick digits.'
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

window.Blockly.JavaScript.switch_bot_on_nth_digit = block => {
    const bot_name = window.Blockly.JavaScript.valueToCode(block, 'BOT_NAME', window.Blockly.JavaScript.ORDER_ATOMIC) || '""';
    const position = window.Blockly.JavaScript.valueToCode(block, 'POSITION', window.Blockly.JavaScript.ORDER_ATOMIC) || '1';
    const comparison = block.getFieldValue('COMPARISON');
    const value = window.Blockly.JavaScript.valueToCode(block, 'VALUE', window.Blockly.JavaScript.ORDER_ATOMIC) || '5';
    
    const code = `
    (function() {
        const nthDigit = Bot.getNthLastDigit(${position});
        let shouldSwitch = false;
        
        switch('${comparison}') {
            case 'equals':
                shouldSwitch = nthDigit === ${value};
                break;
            case 'not_equals':
                shouldSwitch = nthDigit !== ${value};
                break;
            case 'greater':
                shouldSwitch = nthDigit > ${value};
                break;
            case 'less':
                shouldSwitch = nthDigit < ${value};
                break;
            case 'even':
                shouldSwitch = nthDigit % 2 === 0;
                break;
            case 'odd':
                shouldSwitch = nthDigit % 2 !== 0;
                break;
        }
        
        if (shouldSwitch) {
            console.log('🔄 Nth digit ('+${position}+') condition met ('+nthDigit+'), switching to bot: ' + ${bot_name});
            Bot.stop();
            Bot.loadStrategy(${bot_name});
            Bot.start();
        }
    })();
    `;
    
    return code;
};

import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.switch_bot_on_last_digit = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Switch to bot %1 when last digit is %2 %3'),
            args0: [
                {
                    type: 'input_value',
                    name: 'BOT_NAME',
                    check: 'String',
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
                'Switch bot based on the last tick digit value. Useful for digit-based strategies.'
            ),
            category: window.Blockly.Categories.After_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Switch bot on last digit'),
            description: localize(
                'Switches to a different bot based on the last tick digit value.'
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

window.Blockly.JavaScript.switch_bot_on_last_digit = block => {
    const bot_name = window.Blockly.JavaScript.valueToCode(block, 'BOT_NAME', window.Blockly.JavaScript.ORDER_ATOMIC) || '""';
    const comparison = block.getFieldValue('COMPARISON');
    const value = window.Blockly.JavaScript.valueToCode(block, 'VALUE', window.Blockly.JavaScript.ORDER_ATOMIC) || '5';
    
    const code = `
    (function() {
        const lastDigit = Bot.getLastDigit();
        let shouldSwitch = false;
        
        switch('${comparison}') {
            case 'equals':
                shouldSwitch = lastDigit === ${value};
                break;
            case 'not_equals':
                shouldSwitch = lastDigit !== ${value};
                break;
            case 'greater':
                shouldSwitch = lastDigit > ${value};
                break;
            case 'less':
                shouldSwitch = lastDigit < ${value};
                break;
            case 'even':
                shouldSwitch = lastDigit % 2 === 0;
                break;
            case 'odd':
                shouldSwitch = lastDigit % 2 !== 0;
                break;
        }
        
        if (shouldSwitch) {
            console.log('🔄 Last digit condition met ('+lastDigit+'), switching to bot: ' + ${bot_name});
            Bot.stop();
            Bot.loadStrategy(${bot_name});
            Bot.start();
        }
    })();
    `;
    
    return code;
};

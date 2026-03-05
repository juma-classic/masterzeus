import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.switch_bot_on_even_odd = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Switch to bot %1 when %2 of last %3 ticks are %4'),
            args0: [
                {
                    type: 'input_value',
                    name: 'BOT_NAME',
                    check: 'String',
                },
                {
                    type: 'input_value',
                    name: 'PERCENTAGE',
                    check: 'Number',
                },
                {
                    type: 'input_value',
                    name: 'TICK_COUNT',
                    check: 'Number',
                },
                {
                    type: 'field_dropdown',
                    name: 'TYPE',
                    options: [
                        [localize('Even'), 'even'],
                        [localize('Odd'), 'odd'],
                    ],
                },
            ],
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            tooltip: localize(
                'Switch bot when a certain percentage of recent ticks are even or odd. Example: Switch when 70% of last 10 ticks are even.'
            ),
            category: window.Blockly.Categories.After_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Switch bot on even/odd percentage'),
            description: localize(
                'Switches to a different bot based on the percentage of even or odd digits in recent ticks.'
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

window.Blockly.JavaScript.switch_bot_on_even_odd = block => {
    const bot_name = window.Blockly.JavaScript.valueToCode(block, 'BOT_NAME', window.Blockly.JavaScript.ORDER_ATOMIC) || '""';
    const percentage = window.Blockly.JavaScript.valueToCode(block, 'PERCENTAGE', window.Blockly.JavaScript.ORDER_ATOMIC) || '70';
    const tick_count = window.Blockly.JavaScript.valueToCode(block, 'TICK_COUNT', window.Blockly.JavaScript.ORDER_ATOMIC) || '10';
    const type = block.getFieldValue('TYPE');
    
    const code = `
    (function() {
        const lastDigits = Bot.getLastNDigits(${tick_count});
        const targetCount = lastDigits.filter(d => d % 2 ${type === 'even' ? '===' : '!=='} 0);
        const actualPercentage = (targetCount.length / lastDigits.length) * 100;
        
        if (actualPercentage >= ${percentage}) {
            console.log('🔄 ${type} percentage ('+actualPercentage.toFixed(1)+'%) reached, switching to bot: ' + ${bot_name});
            Bot.stop();
            Bot.loadStrategy(${bot_name});
            Bot.start();
        }
    })();
    `;
    
    return code;
};

import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.switch_bot_on_over_under = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Switch to bot %1 when %2% of last %3 ticks are %4 %5'),
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
                    name: 'COMPARISON',
                    options: [
                        [localize('Over'), 'over'],
                        [localize('Under'), 'under'],
                    ],
                },
                {
                    type: 'input_value',
                    name: 'THRESHOLD',
                    check: 'Number',
                },
            ],
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            tooltip: localize(
                'Switch bot when a percentage of ticks are over/under a threshold. Example: Switch when 60% of last 10 ticks are over 5.'
            ),
            category: window.Blockly.Categories.After_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Switch bot on over/under analysis'),
            description: localize(
                'Switches to a different bot based on how many recent digits are above or below a threshold.'
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

window.Blockly.JavaScript.switch_bot_on_over_under = block => {
    const bot_name = window.Blockly.JavaScript.valueToCode(block, 'BOT_NAME', window.Blockly.JavaScript.ORDER_ATOMIC) || '""';
    const percentage = window.Blockly.JavaScript.valueToCode(block, 'PERCENTAGE', window.Blockly.JavaScript.ORDER_ATOMIC) || '60';
    const tick_count = window.Blockly.JavaScript.valueToCode(block, 'TICK_COUNT', window.Blockly.JavaScript.ORDER_ATOMIC) || '10';
    const comparison = block.getFieldValue('COMPARISON');
    const threshold = window.Blockly.JavaScript.valueToCode(block, 'THRESHOLD', window.Blockly.JavaScript.ORDER_ATOMIC) || '5';
    
    const code = `
    (function() {
        const lastDigits = Bot.getLastNDigits(${tick_count});
        const matchingCount = lastDigits.filter(d => d ${comparison === 'over' ? '>' : '<'} ${threshold}).length;
        const actualPercentage = (matchingCount / lastDigits.length) * 100;
        
        if (actualPercentage >= ${percentage}) {
            console.log('🔄 ${comparison} ${threshold} percentage ('+actualPercentage.toFixed(1)+'%) reached, switching to bot: ' + ${bot_name});
            Bot.stop();
            Bot.loadStrategy(${bot_name});
            Bot.start();
        }
    })();
    `;
    
    return code;
};

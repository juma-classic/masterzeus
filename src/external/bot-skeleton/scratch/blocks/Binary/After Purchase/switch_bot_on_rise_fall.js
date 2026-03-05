import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.switch_bot_on_rise_fall = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Switch to bot %1 when %2% of last %3 ticks are %4'),
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
                    name: 'DIRECTION',
                    options: [
                        [localize('Rising'), 'rising'],
                        [localize('Falling'), 'falling'],
                    ],
                },
            ],
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            tooltip: localize(
                'Switch bot based on rise/fall percentage. Analyzes tick direction trends.'
            ),
            category: window.Blockly.Categories.After_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Switch bot on rise/fall percentage'),
            description: localize(
                'Switches to a different bot based on the percentage of rising or falling ticks.'
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

window.Blockly.JavaScript.switch_bot_on_rise_fall = block => {
    const bot_name = window.Blockly.JavaScript.valueToCode(block, 'BOT_NAME', window.Blockly.JavaScript.ORDER_ATOMIC) || '""';
    const percentage = window.Blockly.JavaScript.valueToCode(block, 'PERCENTAGE', window.Blockly.JavaScript.ORDER_ATOMIC) || '60';
    const tick_count = window.Blockly.JavaScript.valueToCode(block, 'TICK_COUNT', window.Blockly.JavaScript.ORDER_ATOMIC) || '10';
    const direction = block.getFieldValue('DIRECTION');
    
    const code = `
    (function() {
        const lastDigits = Bot.getLastNDigits(${tick_count});
        let risingCount = 0;
        for (let i = 1; i < lastDigits.length; i++) {
            if (lastDigits[i] > lastDigits[i-1]) {
                risingCount++;
            }
        }
        const risingPercentage = (risingCount / (lastDigits.length - 1)) * 100;
        const fallingPercentage = 100 - risingPercentage;
        const actualPercentage = '${direction}' === 'rising' ? risingPercentage : fallingPercentage;
        
        if (actualPercentage >= ${percentage}) {
            console.log('🔄 ${direction} percentage ('+actualPercentage.toFixed(1)+'%) reached, switching to bot: ' + ${bot_name});
            Bot.stop();
            Bot.loadStrategy(${bot_name});
            Bot.start();
        }
    })();
    `;
    
    return code;
};

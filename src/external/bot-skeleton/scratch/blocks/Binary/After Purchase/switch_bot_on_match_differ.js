import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.switch_bot_on_match_differ = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Switch to bot %1 when %2% of last %3 ticks %4 prediction'),
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
                        [localize('Match'), 'match'],
                        [localize('Differ'), 'differ'],
                    ],
                },
            ],
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            tooltip: localize(
                'Switch bot based on match/differ analysis. Compares consecutive ticks to see if they match or differ.'
            ),
            category: window.Blockly.Categories.After_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Switch bot on match/differ analysis'),
            description: localize(
                'Switches to a different bot based on how often consecutive tick digits match or differ.'
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

window.Blockly.JavaScript.switch_bot_on_match_differ = block => {
    const bot_name = window.Blockly.JavaScript.valueToCode(block, 'BOT_NAME', window.Blockly.JavaScript.ORDER_ATOMIC) || '""';
    const percentage = window.Blockly.JavaScript.valueToCode(block, 'PERCENTAGE', window.Blockly.JavaScript.ORDER_ATOMIC) || '60';
    const tick_count = window.Blockly.JavaScript.valueToCode(block, 'TICK_COUNT', window.Blockly.JavaScript.ORDER_ATOMIC) || '10';
    const type = block.getFieldValue('TYPE');
    
    const code = `
    (function() {
        const lastDigits = Bot.getLastNDigits(${tick_count});
        let matchCount = 0;
        for (let i = 1; i < lastDigits.length; i++) {
            if (lastDigits[i] === lastDigits[i-1]) {
                matchCount++;
            }
        }
        const matchPercentage = (matchCount / (lastDigits.length - 1)) * 100;
        const differPercentage = 100 - matchPercentage;
        const actualPercentage = '${type}' === 'match' ? matchPercentage : differPercentage;
        
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

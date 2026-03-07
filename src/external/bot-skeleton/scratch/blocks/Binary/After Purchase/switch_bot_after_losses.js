import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.switch_bot_after_losses = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Switch to bot %1 after %2 consecutive losses'),
            args0: [
                {
                    type: 'input_value',
                    name: 'BOT_NAME',
                    check: 'String',
                },
                {
                    type: 'input_value',
                    name: 'LOSS_COUNT',
                    check: 'Number',
                },
            ],
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            tooltip: localize(
                'This block switches to a different bot strategy after a specified number of consecutive losses. More controlled than switching on every loss.'
            ),
            category: window.Blockly.Categories.After_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Switch bot after consecutive losses'),
            description: localize(
                'Switches to a different bot strategy only after experiencing a specified number of consecutive losses. This prevents switching too frequently.'
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

window.Blockly.JavaScript.javascriptGenerator.forBlock.switch_bot_after_losses = block => {
    const bot_name = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'BOT_NAME',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '""';
    const loss_count = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'LOSS_COUNT',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '3';
    
    const code = `
    (function() {
        if (!Bot.consecutiveLosses) Bot.consecutiveLosses = 0;
        
        const result = Bot.readDetails(10);
        if (result === 'loss') {
            Bot.consecutiveLosses++;
            console.log('📉 Consecutive losses: ' + Bot.consecutiveLosses);
            
            if (Bot.consecutiveLosses >= ${loss_count}) {
                console.log('🔄 Switching to bot: ' + ${bot_name});
                Bot.consecutiveLosses = 0;
                Bot.stop();
                Bot.loadStrategy(${bot_name});
                Bot.start();
            }
        } else if (result === 'win') {
            Bot.consecutiveLosses = 0;
        }
    })();
    `;
    
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
};

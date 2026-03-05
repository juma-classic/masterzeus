import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.switch_bot_on_loss = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Switch to bot %1 on loss'),
            args0: [
                {
                    type: 'input_value',
                    name: 'BOT_NAME',
                    check: 'String',
                },
            ],
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            tooltip: localize(
                'This block switches to a different bot strategy when a loss occurs. Place the bot file name (e.g., "My Bot.xml") in the input field.'
            ),
            category: window.Blockly.Categories.After_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Switch bot on loss'),
            description: localize(
                'Automatically switches to a different bot strategy when the current trade results in a loss. The bot will stop, load the new strategy, and restart automatically.'
            ),
        };
    },
    onchange(event) {
        if (!this.workspace || this.isInFlyout || this.workspace.isDragging()) {
            return;
        }

        // Check if this block is inside "Restart trading conditions"
        const top_parent = this.getTopParent();
        if (top_parent && top_parent.type !== 'after_purchase') {
            this.setDisabled(true);
        } else {
            this.setDisabled(false);
        }
    },
};

window.Blockly.JavaScript.switch_bot_on_loss = block => {
    const bot_name = window.Blockly.JavaScript.valueToCode(block, 'BOT_NAME', window.Blockly.JavaScript.ORDER_ATOMIC) || '""';
    
    const code = `
    (function() {
        const lastProfit = Bot.getLastProfit();
        if (lastProfit < 0) {
            console.log('🔄 Loss detected, switching to bot: ' + ${bot_name});
            Bot.stop();
            Bot.loadStrategy(${bot_name});
            Bot.start();
        }
    })();
    `;
    
    return code;
};

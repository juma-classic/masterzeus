import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.switch_market_on_loss = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Switch to market %1 on loss'),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'MARKET',
                    options: [
                        [localize('Derived'), 'synthetic_index'],
                        [localize('Forex'), 'forex'],
                        [localize('Stock Indices'), 'indices'],
                        [localize('Commodities'), 'commodities'],
                        [localize('Cryptocurrencies'), 'cryptocurrency'],
                    ],
                },
            ],
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            tooltip: localize(
                'This block switches to a different market when a loss occurs. The bot will restart with the new market selection.'
            ),
            category: window.Blockly.Categories.After_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Switch market on loss'),
            description: localize(
                'Automatically switches to a different market when the current trade results in a loss. Useful for diversifying across different asset types.'
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

window.Blockly.JavaScript.switch_market_on_loss = block => {
    const market = block.getFieldValue('MARKET');
    
    const code = `
    (function() {
        const result = Bot.readDetails(10);
        if (result === 'loss') {
            console.log('🔄 Loss detected, switching to market: ${market}');
            Bot.setMarket('${market}');
            Bot.restart();
        }
    })();
    `;
    
    return code;
};

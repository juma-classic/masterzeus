import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../utils';

window.Blockly.Blocks.even_odd_percentage = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('{{ percentage }}% of last {{ count }} ticks are {{ type }}', { 
                percentage: '%1', 
                count: '%2', 
                type: '%3' 
            }),
            args0: [
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
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns true if the specified percentage of recent ticks are even or odd'),
            category: window.Blockly.Categories.Tick_Analysis,
        };
    },
    meta() {
        return {
            display_name: localize('Even/Odd percentage'),
            description: localize(
                'Checks if a certain percentage of recent tick digits are even or odd. Example: 70% of last 10 ticks are even.'
            ),
        };
    },
    customContextMenu(menu) {
        modifyContextMenu(menu);
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.even_odd_percentage = block => {
    const percentage = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'PERCENTAGE',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '70';
    const tick_count = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'TICK_COUNT',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '10';
    const type = block.getFieldValue('TYPE');
    
    const code = `(function() {
        const lastDigits = Bot.getLastDigitList().slice(-${tick_count});
        const targetCount = lastDigits.filter(d => d % 2 ${type === 'even' ? '===' : '!=='} 0).length;
        const actualPercentage = (targetCount / lastDigits.length) * 100;
        return actualPercentage >= ${percentage};
    })()`;
    
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};

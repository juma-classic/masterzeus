import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../utils';

window.Blockly.Blocks.match_differ_percentage = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('{{ percentage }}% of last {{ count }} ticks {{ type }} prediction', { 
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
                        [localize('Match'), 'match'],
                        [localize('Differ'), 'differ'],
                    ],
                },
            ],
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns true if the specified percentage of consecutive ticks match or differ'),
            category: window.Blockly.Categories.Tick_Analysis,
        };
    },
    meta() {
        return {
            display_name: localize('Match/Differ percentage'),
            description: localize(
                'Checks if consecutive tick digits match or differ at a certain rate. Useful for match/differ strategies.'
            ),
        };
    },
    customContextMenu(menu) {
        modifyContextMenu(menu);
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.match_differ_percentage = block => {
    const percentage = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'PERCENTAGE',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '60';
    const tick_count = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'TICK_COUNT',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '10';
    const type = block.getFieldValue('TYPE');
    
    const code = `(function() {
        const lastDigits = Bot.getLastNDigits(${tick_count});
        let matchCount = 0;
        for (let i = 1; i < lastDigits.length; i++) {
            if (lastDigits[i] === lastDigits[i-1]) matchCount++;
        }
        const matchPercentage = (matchCount / (lastDigits.length - 1)) * 100;
        const actualPercentage = '${type}' === 'match' ? matchPercentage : (100 - matchPercentage);
        return actualPercentage >= ${percentage};
    })()`;
    
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};

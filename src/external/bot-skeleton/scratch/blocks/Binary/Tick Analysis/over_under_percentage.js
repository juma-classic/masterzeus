import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../utils';

window.Blockly.Blocks.over_under_percentage = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('%1% of last %2 ticks are %3 %4'),
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
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns true if the specified percentage of ticks are over/under a threshold'),
            category: window.Blockly.Categories.Tick_Analysis,
        };
    },
    meta() {
        return {
            display_name: localize('Over/Under percentage'),
            description: localize(
                'Checks if a percentage of recent digits are above or below a threshold. Example: 60% of last 10 ticks are over 5.'
            ),
        };
    },
    customContextMenu(menu) {
        modifyContextMenu(menu);
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.over_under_percentage = block => {
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
    const comparison = block.getFieldValue('COMPARISON');
    const threshold = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'THRESHOLD',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '5';
    
    const code = `(function() {
        const lastDigits = Bot.getLastNDigits(${tick_count});
        const matchingCount = lastDigits.filter(d => d ${comparison === 'over' ? '>' : '<'} ${threshold}).length;
        const actualPercentage = (matchingCount / lastDigits.length) * 100;
        return actualPercentage >= ${percentage};
    })()`;
    
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};

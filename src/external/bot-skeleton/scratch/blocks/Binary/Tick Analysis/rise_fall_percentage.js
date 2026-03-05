import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../utils';

window.Blockly.Blocks.rise_fall_percentage = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('{{ percentage }}% of last {{ count }} ticks are {{ direction }}', { 
                percentage: '%1', 
                count: '%2', 
                direction: '%3' 
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
                    name: 'DIRECTION',
                    options: [
                        [localize('Rising'), 'rising'],
                        [localize('Falling'), 'falling'],
                    ],
                },
            ],
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns true if the specified percentage of ticks are rising or falling'),
            category: window.Blockly.Categories.Tick_Analysis,
        };
    },
    meta() {
        return {
            display_name: localize('Rise/Fall percentage'),
            description: localize(
                'Checks if a percentage of recent ticks are rising or falling. Analyzes tick direction trends.'
            ),
        };
    },
    customContextMenu(menu) {
        modifyContextMenu(menu);
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.rise_fall_percentage = block => {
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
    const direction = block.getFieldValue('DIRECTION');
    
    const code = `(function() {
        const lastDigits = Bot.getLastNDigits(${tick_count});
        let risingCount = 0;
        for (let i = 1; i < lastDigits.length; i++) {
            if (lastDigits[i] > lastDigits[i-1]) risingCount++;
        }
        const risingPercentage = (risingCount / (lastDigits.length - 1)) * 100;
        const actualPercentage = '${direction}' === 'rising' ? risingPercentage : (100 - risingPercentage);
        return actualPercentage >= ${percentage};
    })()`;
    
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};

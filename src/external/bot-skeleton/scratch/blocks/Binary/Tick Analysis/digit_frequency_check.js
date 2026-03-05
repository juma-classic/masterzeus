import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../utils';

window.Blockly.Blocks.digit_frequency_check = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Digit {{ digit }} appears {{ comparison }} {{ count }} times in last {{ tick_count }} ticks', { 
                digit: '%1', 
                comparison: '%2', 
                count: '%3',
                tick_count: '%4'
            }),
            args0: [
                {
                    type: 'input_value',
                    name: 'DIGIT',
                    check: 'Number',
                },
                {
                    type: 'field_dropdown',
                    name: 'COMPARISON',
                    options: [
                        [localize('exactly'), 'equals'],
                        [localize('more than'), 'greater'],
                        [localize('less than'), 'less'],
                        [localize('at least'), 'greater_equal'],
                        [localize('at most'), 'less_equal'],
                    ],
                },
                {
                    type: 'input_value',
                    name: 'COUNT',
                    check: 'Number',
                },
                {
                    type: 'input_value',
                    name: 'TICK_COUNT',
                    check: 'Number',
                },
            ],
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns true if a specific digit appears a certain number of times in recent ticks'),
            category: window.Blockly.Categories.Tick_Analysis,
        };
    },
    meta() {
        return {
            display_name: localize('Digit frequency check'),
            description: localize(
                'Checks how often a specific digit appears in recent ticks. Example: Digit 7 appears more than 3 times in last 10 ticks.'
            ),
        };
    },
    customContextMenu(menu) {
        modifyContextMenu(menu);
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.digit_frequency_check = block => {
    const digit = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'DIGIT',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '5';
    const comparison = block.getFieldValue('COMPARISON');
    const count = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'COUNT',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '3';
    const tick_count = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'TICK_COUNT',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '10';
    
    const code = `(function() {
        const lastDigits = Bot.getLastNDigits(${tick_count});
        const frequency = lastDigits.filter(d => d === ${digit}).length;
        switch('${comparison}') {
            case 'equals': return frequency === ${count};
            case 'greater': return frequency > ${count};
            case 'less': return frequency < ${count};
            case 'greater_equal': return frequency >= ${count};
            case 'less_equal': return frequency <= ${count};
            default: return false;
        }
    })()`;
    
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};

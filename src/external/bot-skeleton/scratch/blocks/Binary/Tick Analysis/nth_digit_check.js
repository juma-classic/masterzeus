import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../utils';

window.Blockly.Blocks.nth_digit_check = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('{{ position }} last digit is {{ comparison }} {{ value }}', { 
                position: '%1', 
                comparison: '%2', 
                value: '%3' 
            }),
            args0: [
                {
                    type: 'input_value',
                    name: 'POSITION',
                    check: 'Number',
                },
                {
                    type: 'field_dropdown',
                    name: 'COMPARISON',
                    options: [
                        [localize('equals'), 'equals'],
                        [localize('not equals'), 'not_equals'],
                        [localize('greater than'), 'greater'],
                        [localize('less than'), 'less'],
                        [localize('is even'), 'even'],
                        [localize('is odd'), 'odd'],
                    ],
                },
                {
                    type: 'input_value',
                    name: 'VALUE',
                    check: 'Number',
                },
            ],
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns true if the Nth last digit meets the condition. Position 1 = last, 2 = second last, etc.'),
            category: window.Blockly.Categories.Tick_Analysis,
        };
    },
    meta() {
        return {
            display_name: localize('Nth last digit check'),
            description: localize(
                'Checks a specific position in recent tick digits. Use 1 for last digit, 2 for second last, etc.'
            ),
        };
    },
    customContextMenu(menu) {
        modifyContextMenu(menu);
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.nth_digit_check = block => {
    const position = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'POSITION',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '1';
    const comparison = block.getFieldValue('COMPARISON');
    const value = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'VALUE',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '5';
    
    const code = `(function() {
        const digitList = Bot.getLastDigitList();
        const nthDigit = digitList[digitList.length - ${position}];
        switch('${comparison}') {
            case 'equals': return nthDigit === ${value};
            case 'not_equals': return nthDigit !== ${value};
            case 'greater': return nthDigit > ${value};
            case 'less': return nthDigit < ${value};
            case 'even': return nthDigit % 2 === 0;
            case 'odd': return nthDigit % 2 !== 0;
            default: return false;
        }
    })()`;
    
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};

import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../utils';

window.Blockly.Blocks.digit_condition = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Last {{ count }} digits {{ condition }} {{ pattern }}', { 
                count: '%1', 
                condition: '%2', 
                pattern: '%3' 
            }),
            args0: [
                {
                    type: 'input_value',
                    name: 'DIGIT_COUNT',
                    check: 'Number',
                },
                {
                    type: 'field_dropdown',
                    name: 'CONDITION',
                    options: [
                        [localize('are all even'), 'all_even'],
                        [localize('are all odd'), 'all_odd'],
                        [localize('are all same'), 'all_same'],
                        [localize('are all rising'), 'all_rising'],
                        [localize('are all falling'), 'all_falling'],
                        [localize('match pattern'), 'match_pattern'],
                    ],
                },
                {
                    type: 'input_value',
                    name: 'PATTERN',
                    check: 'String',
                },
            ],
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns true if the last N digits match the specified pattern condition'),
            category: window.Blockly.Categories.Tick_Analysis,
        };
    },
    meta() {
        return {
            display_name: localize('Digit pattern condition'),
            description: localize(
                'Checks if recent tick digits match specific patterns like all even, all odd, all same, rising, falling, or a custom pattern.'
            ),
        };
    },
    customContextMenu(menu) {
        modifyContextMenu(menu);
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.digit_condition = block => {
    const digit_count = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'DIGIT_COUNT',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '5';
    const condition = block.getFieldValue('CONDITION');
    const pattern = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'PATTERN',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '""';
    
    const code = `(function() {
        const lastDigits = Bot.getLastDigitList().slice(-${digit_count});
        switch('${condition}') {
            case 'all_even': return lastDigits.every(d => d % 2 === 0);
            case 'all_odd': return lastDigits.every(d => d % 2 !== 0);
            case 'all_same': return lastDigits.every(d => d === lastDigits[0]);
            case 'all_rising': return lastDigits.every((d, i) => i === 0 || d > lastDigits[i-1]);
            case 'all_falling': return lastDigits.every((d, i) => i === 0 || d < lastDigits[i-1]);
            case 'match_pattern': return lastDigits.join('') === ${pattern}.toString();
            default: return false;
        }
    })()`;
    
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};

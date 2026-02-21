const ENTER_KEY = 13;
const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;

const NUMBER_POSITION = 1;
const FIRST_INPUT_POSITION = 1;
const INPUT_COUNT = 4;
const LAST_INPUT_POSITION = 4;

let isByAction;
let inputsPrevVal = {}

const proportion = function (a, b, c) {
    const num_a = Big(a), num_b = Big(b), num_c = Big(c);
    return num_a.mul(num_b).div(num_c).round(2);
};

const hasOneUnknown = function (elements) {
    let filtered = elements
        .map(e => e.value)
        .filter(e => e);

    return filtered.length === 3;
}

const toElement = function (elements) {
    return elements
        .map(e => ({value: e.value, pos: e.classList[NUMBER_POSITION], self: e}))
        .reduce((acc, e) => {
            acc[e.pos] = e;
            return acc;
        }, {});
};

const onKeyUp = function (e) {

    let position = +e.target.classList[NUMBER_POSITION],
        isEnterPress = ENTER_KEY === e.keyCode,
            isBackspacePress = e.inputType === 'deleteContentBackward' || e.code === "Backspace" && e.key === 'Backspace';

    if (false === isEnterPress && false === isBackspacePress) {
        inputsPrevVal[position] = e.target.value;
        return;
    }

    try {

        let inputs = Array.from(document.getElementsByClassName('input'));

        if (!e.target.value && isBackspacePress) {

            let prevPosition = position - 2,
                inputsPrevValElement = inputsPrevVal[position];

            if (FIRST_INPUT_POSITION === position) {
                return;
            }

            if (inputsPrevValElement) {
                inputsPrevVal[position] = null;
                return;
            }

            inputs[prevPosition].focus();
            return;
        }

        if (hasOneUnknown(inputs) === false) {
            if (isEnterPress) {
                let nextPosition = LAST_INPUT_POSITION === position ? 0 : position;
                inputs[nextPosition].focus();
                return;
            }
        }

        if (isEnterPress) {
            let values = toElement(inputs),
                emptyPos = Object.values(values).filter(e => !e.value)[0].pos,
                unknownInput = values[parseInt(emptyPos)],
                argPosition = {'1': [2, 3, 4], '2': [1, 4, 3], '3': [1, 4, 2], '4': [2, 3, 1]},
                argPositionElement = argPosition[emptyPos],
                args = argPositionElement.map(index => {

                    let inputValue = values[index].value,
                        numberStringValue = inputValue.replace(/,/g, '');

                    return parseFloat(numberStringValue);
                });

            isByAction = true;
            unknownInput.self.value = toCurrency(proportion.apply(null, args));
            unknownInput.self.dispatchEvent(new Event('input'));
            isByAction = false;
        }

    } catch (Error) {

        let error = document.getElementById('tooltip-error');

        if (!error.classList.contains('hidden')) {
            return;
        }

        error.classList.toggle('hidden');
        setTimeout(function () {
            error.classList.toggle('hidden')
        }, 1500)
    }

}

const recalcWidth = function (self) {

    // 91ch = 844.53
    // 29ch = 288.48
    // 28ch = 269.94 == 18,54
    // 7ch = 103.13
    // 1ch = 85.43 == 17,7

    //10 = 78
    //1 = 64 == 14

    self.style.width = self.value.length + "ch";
}

const toCurrency = function (nStr) {

    if (!nStr) {
        return null;
    }

    nStr = nStr + '';
    let x = nStr.split('.'),
        x1 = x[0],
        x2 = x.length > 1 ? '.' + x[1] : '',
        rgx = /(\d+)(\d{3})/;

    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }

    return x1 + x2;
}

const cleanInputIfNeeded = function (e) {

    let inputs = Array.from(document.getElementsByClassName("input"));

    //if all inputs are filled
    if (INPUT_COUNT !== inputs.map(elem => elem.value).filter(elem => elem).length) {
        return;
    }

    //if current filled input is the last one we will clean the third. If its any other we will clean the last
    let isForth = LAST_INPUT_POSITION === +e.target.classList[NUMBER_POSITION];
    inputs[isForth ? 2 : 3].value = null;
}

const onInput = function (e) {

    if (isByAction) {
        return;
    }

    let self = this,
        char = e.data;

    //if its a letter, remove it
    if (char && (char.toUpperCase() != char.toLowerCase() || char.codePointAt(0) > 127)) {

        if (self.value.indexOf(',') !== -1) {
            self.value = self.value.replaceAll(',', '')
        }
        let match = self.value.match(/\d+(\.\d+)?/g);
        self.value = toCurrency(match && match[0] || null);
        return;
    }

    self.value = toCurrency(self.value.replace(/,/g, ''));
    recalcWidth(self);

    cleanInputIfNeeded(e);
};

const toggleGuide = function (e) {
    document.getElementById('guide').classList.toggle("hidden");
};

const onCurrencyKeyup = function (e, numberInputs, currencyInputs) {

    let isNotEnterPress = ENTER_KEY !== e.keyCode;

    if (isNotEnterPress) {
        return;
    }

    let position = +e.target.classList[NUMBER_POSITION];

    if (2 === position) {
        numberInputs[0].focus();
    } else {
        //pos - 1 is array defenition of position. So 1 is next
        currencyInputs[position].focus();
    }
};

//todo cute guide
//todo parse url to share/share button
window.onload = function () {

    let inputs = Array.from(document.getElementsByClassName('input'));

    inputs.forEach(input => {
        input.value = null;
        input.addEventListener("input", onInput)
        input.addEventListener("keyup", onKeyUp)
    })

    let currencyInputs = document.getElementsByClassName('cur');
    Array.from(currencyInputs).forEach(input => {
        input.value = null;
        input.addEventListener("keyup", e => onCurrencyKeyup(e, inputs, currencyInputs));
    });

    let questionMark = document.getElementsByClassName('question-mark')[0];

    if (questionMark) {
        questionMark.addEventListener("click", toggleGuide);
    }

}


const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;

const FIRST_INPUT_POSITION = 1;
const INPUT_COUNT = 4;
const LAST_INPUT_POSITION = 4;

let isByAction;
let inputsPrevVal = {}

const proportion = function (a, b, c) {
    const num_a = Big(a), num_b = Big(b), num_c = Big(c);
    return num_a.mul(num_b).div(num_c).round(5).toNumber();
};

const hasOneUnknown = function (elements) {
    let filtered = elements
        .map(e => e.value)
        .filter(e => e);

    return filtered.length === 3;
}

const onKeyUp = function (e) {

    let position = e.getPosition(),
        isEnterPress = e.isEnterPress(),
        isBackspacePress = e.isBackspacePress();

    if (false === isEnterPress && false === isBackspacePress) {
        inputsPrevVal[position] = e.target.value;
        return;
    }

    try {

        let inputs = Array.from(document.getElementsByClassName('input'));

        if (!e.target.value && isBackspacePress) {

            let prevPosition = position - 2,
                inputsPrevValElement = inputsPrevVal[position];

            //if backspace was pressed to delete everything, it should stop on first input
            if (FIRST_INPUT_POSITION === position) {
                return;
            }

            //if we do not save state backspace after cleaning all input jump to previous one to fast. Maybe user delete from current to fill it again
            //so we save a state. If its empty it means user want to delete more
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

            let emptyPos = Object.values(inputs).filter(input => !input.value)[0].getPosition(),
                unknownInput = inputs[emptyPos - 1],
                argPosition = {'1': [2, 3, 4], '2': [1, 4, 3], '3': [1, 4, 2], '4': [2, 3, 1]},
                argPositionElement = argPosition[emptyPos],
                args = argPositionElement.map(index => {

                    let inputValue = inputs[index - 1].value,
                        numberStringValue = inputValue.replace(/,/g, '');

                    return parseFloat(numberStringValue);
                });


            isByAction = true;
            unknownInput.value = toCurrency(proportion.apply(null, args));
            unknownInput.dispatchEvent(new Event('input'));
            isByAction = false;
        }

    } catch (e) {

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
    let isForth = LAST_INPUT_POSITION === e.getPosition();
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

    if (false === e.isEnterPress()) {
        return;
    }

    let position = e.getPosition();

    if (2 === position) {
        numberInputs[0].focus();
    } else {
        //pos - 1 is array definition of position. So 1 is next
        currencyInputs[position].focus();
    }
};

const INPUT_TAG_NAME = 'INPUT';
const ENTER_KEY = 13;
const NUMBER_POSITION = 1;
const defineMethods = function () {

    const getPosition = function () {

        let s = this.target ? this.target : this;

        if (INPUT_TAG_NAME !== s.tagName) {
            return null;
        }

        return +s.classList[NUMBER_POSITION];
    };

    Object.defineProperty(Event.prototype, 'getPosition', {
        value: getPosition,
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Event.prototype, 'isEnterPress', {
        value: function () {
            return 'Enter' === this.key || ENTER_KEY === this.keyCode;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Event.prototype, 'isBackspacePress', {
        value: function () {
            return this.inputType === 'deleteContentBackward' || this.code === "Backspace" || this.key === 'Backspace'
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(HTMLInputElement.prototype, 'getPosition', {
        value: getPosition,
        enumerable: false,
        configurable: true
    });
}

const makeShareLink = function (e) {

    const queryCur = Array.from(document.getElementsByClassName('cur'))
        .map((s, index) => `${index === 0 ? 'cur1' : 'cur2'}=${s.value}`)
        .join('&');

    const queryVal = Array.from(document.getElementsByClassName('input'))
        .map((s, index) => `&${index + 1}=${s.value}`)
        .join('');

    const query = getURL() + '?' + queryCur + queryVal;

    const promise = navigator.clipboard.writeText(query);
    return promise.then(e => {

        const elementsByClassName = document.getElementsByClassName('copy-text')[0];

        if (!elementsByClassName) {
            return
        }

        const classList = elementsByClassName.classList;

        if (!classList.contains('hidden')) {
            return;
        }

        classList.toggle('hidden');
        setTimeout(function () {classList.toggle('hidden')},1500);
    });
}

const getURL = function () {
    return window.location.protocol + "//" + window.location.host + window.location.pathname;
};

//todo cute guide
window.onload = function () {

    defineMethods();

    const params = new URLSearchParams(window.location.search);

    let inputs = Array.from(document.getElementsByClassName('input'));

    inputs.forEach((input, index) => {
        input.value = toCurrency(params.get(index + 1));
        input.addEventListener('input', onInput)
        input.addEventListener('keyup', onKeyUp)
    })

    let currencyInputs = Array.from(document.getElementsByClassName('cur'));
    currencyInputs.forEach((currency, index) => {
        currency.value = params.get('cur' + (index + 1));
        currency.addEventListener('keyup', e => onCurrencyKeyup(e, inputs, currencyInputs));
    });

    let questionMark = document.getElementsByClassName('question-mark')[0];
    if (questionMark) {
        questionMark.addEventListener('click', toggleGuide);
    }

    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {

        const shareIcon = document.querySelector('.share');
        const release = () => shareIcon.classList.remove('pressed');
        const press = () => shareIcon.classList.add('pressed');

        shareBtn.addEventListener('mousedown', press);
        shareBtn.addEventListener('mouseup', release);
        shareBtn.addEventListener('mouseleave', release);
        shareBtn.addEventListener('touchstart', press);
        shareBtn.addEventListener('touchend', release);
        shareBtn.addEventListener('click', makeShareLink);
    }

    const cleanUrl = getURL();
    window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
}

document.addEventListener('DOMContentLoaded', function () {
    //this app works only with numbers, so its logical to allow number keyboard
    //but on "magical apple" devices the number keyboard DO NOT have an enter key
    //So, do switch it to text inputs on I-something.
    //Maybe the reason behind it its do not to do a submit and we clean one button. But in general its became even worse, its still have something like submit button, but its does not enter anymore. And in cases like mine UI should add one more button to initiate a submit...
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (!isIOS) {
        return;
    }

    const inputs = Array.from(document.getElementsByClassName('input'));
    inputs.forEach(input => input.setAttribute('inputmode', 'text'));
});

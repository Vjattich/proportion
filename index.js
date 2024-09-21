const ENTER_KEY = 13;
const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;

const NUMBER_POSITION = 1;

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

//todo tooltip for use
//todo drag and drop event switch values event
//todo add currency at the end and block input and auto set currency on other column if it filled
const onKeyUp = function (e) {

    let inputs = Array.from(document.getElementsByClassName('input'));

    if (hasOneUnknown(inputs) === false) {
        return;
    }

    let isEnterPress = ENTER_KEY === e.keyCode;

    if (isEnterPress) {

        let values = toElement(inputs),
            emptyPos = Object.values(values).filter(e => !e.value)[0].pos,
            unknownInput = values[parseInt(emptyPos)],
            argPosition = {'1': [2, 3, 4], '2': [1, 4, 3], '3': [1, 4, 2], '4': [2, 3, 1]},
            argPositionElement = argPosition[emptyPos],
            args = argPositionElement.map(e => parseFloat(values[e].value.replace(/,/g, '')));

        unknownInput.self.value = proportion.apply(null, args);
        unknownInput.self.dispatchEvent(new Event('input'))
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

const doFormatter = function (self) {

    const toCurrency = function (nStr) {
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

    if (!self || !self.value) {
        return;
    }

    let val = self.value.replace(/,/g, '');

    self.value = toCurrency(val);
}

const onInput = function (e) {
    let self = this,
        char = e.data;

    if (char && (char.toUpperCase() != char.toLowerCase() || char.codePointAt(0) > 127)) {
        let match = self.value.match(/\d\./g) || [];
        self.value = match.join('')
    }

    doFormatter(self, e);
    recalcWidth(self);
};


window.onload = function () {

    let inputs = Array.from(document.getElementsByClassName('input'));

    inputs.forEach(input => {
        input.addEventListener("input", onInput)
        input.addEventListener("keyup", onKeyUp)
    })

}


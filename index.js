const ENTER_KEY = 13;
const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;

const NUMBER_POSITION = 1;

const proportion = function (a, b, c) {
    return round2((a * b) / c)
};

const round2 = function (num) {
    return Math.round((num + Number.EPSILON) * 100) / 100
};

const isEnoughFilled = function (elements) {
    let filtered = elements
        .map(e => e.value)
        .filter(e => e);

    return filtered.length >= 3;
}

const toElement = function (elements) {
    return elements
        .map(e => ({value: e.value, pos: e.classList[NUMBER_POSITION], self: e}))
        .reduce((acc, e) => {
            acc[e.pos] = e;
            return acc;
        }, {});
};

const getSibling = function (self, upOrDown, isNext) {

    if (!self) {
        return;
    }

    if (upOrDown === false) {
        return isNext ? self.nextElementSibling : self.previousElementSibling;
    }

    let pos = parseInt(self.classList[NUMBER_POSITION]),
        next = isNext ? pos - 2 : pos + 2,
        inputs = Array.from(self.parentElement.parentElement.getElementsByTagName("input"));

    return inputs.filter(e => parseInt(e.classList[NUMBER_POSITION]) === next)[0];
};

const nextInput = function (self) {
    return getSibling(self, false, true);
};

const prevInput = function (self) {
    return getSibling(self, false, false);
};

const upInput = function (self) {
    return getSibling(self, true, true)
};

const downInput = function (self) {
    return getSibling(self, true, false)
};

const move = function (self, e) {

    let elem = self;

    switch (e.keyCode) {
        case LEFT_KEY:
            elem = prevInput(self);
            break;
        case UP_KEY:
            elem = upInput(self);
            break;
        case RIGHT_KEY:
            elem = nextInput(self);
            break;
        case DOWN_KEY:
            elem = downInput(self);
            break;
    }

    (elem || self).focus();
}

//todo validate input
//todo input big value foramtters
//todo add currency at the end and block input
//todo auto set currency on other column if it filled
const onKeyUp = function (self, e) {

    let isArrowPress = [LEFT_KEY, UP_KEY, RIGHT_KEY, DOWN_KEY].indexOf(e.keyCode) !== -1;

    if (isArrowPress) {
        move(self, e);
        return;
    }

    let inputs = Array.from(document.getElementsByClassName('input'));

    if (isEnoughFilled(inputs) === false) {
        return;
    }

    let isEnterPress = ENTER_KEY === e.keyCode;

    if (isEnterPress) {

        let values = toElement(inputs),
            emptyPos = Object.values(values).filter(e => !e.value)[0].pos,
            argPosition = {'1': [2, 3, 4], '2': [1, 4, 3], '3': [1, 4, 2], '4': [2, 3, 1]},
            argPositionElement = argPosition[emptyPos],
            args = argPositionElement.map(e => parseFloat(values[e].value));

        values[parseInt(emptyPos)].self.value = proportion.apply(null, args)
    }

}

const recalcWidth = function (self) {
    self.style.width = self.value.length + "ch";
}

const doFormatter = function (self) {

    if (!self || !self.value) {
        return;
    }

    let val = self.value.replace(/,/g, '');

    self.value = parseFloat(val).toLocaleString();
}

const onInput = function (self, e) {
    recalcWidth(self);
    doFormatter(self, e);
};

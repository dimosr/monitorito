"use strict";

function NodeMetric(codeName, displayName, minValue, maxValue, calculationFunction) {
    this._codename = codeName;
    this._displayName = displayName;
    this._minValue = minValue;
    this._maxValue = maxValue;

    if(calculationFunction.length != 2) throw new Error("calculation callback function should have 2 formal parameters: node, graphStatistics.");
    this._calculationFunction = calculationFunction;
}

NodeMetric.prototype.getCodeName = function() {
    return this._codename;
}

NodeMetric.prototype.getDisplayName = function() {
    return this._displayName;
}

NodeMetric.prototype.getMinValue = function() {
    return this._minValue;
}

NodeMetric.prototype.getMaxValue = function() {
    return this._maxValue;
}

NodeMetric.prototype.calculate = function(node, graphStatistics) {
    return this._calculationFunction(node, graphStatistics);
}
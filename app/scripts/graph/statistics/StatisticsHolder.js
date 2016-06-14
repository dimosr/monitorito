function StatisticsHolder() {
	this.max = 0;
	this.min = Number.MAX_SAFE_INTEGER;
	this._occ = {};
	this.M = 0;
	this.S = 0;
	this.sampleSize = 0;
}

StatisticsHolder.prototype.getStatistics = function() {
	return {
		avg: this.M,
		stdDev: this.getStdDevFromS(this.S, this.sampleSize),
		max: this.max,
		min: this.min
	};
}

StatisticsHolder.prototype.getStdDevFromS = function(S, n) {
	var variance = (n > 1) ? (S/n) : 0;
	return Math.sqrt(variance);
}

/* @Docs
This method keeps track of the maximum,minimum of a sample
where members of the sample are provided as stream.
Method called with:
- both parameters set, for changing the value of an existing member
- only first parameter, to add a new member in the sample
*/
StatisticsHolder.prototype.updateMinAndMax = function(newValue, previousValue) {
	if(!(newValue in this._occ)) {
		this.min = Math.min(this.min, newValue);
		this.max = Math.max(this.max, newValue);
		this._occ[newValue] = 1;
	}
	else this._occ[newValue]++;

	if(previousValue !== undefined) {
		this._occ[previousValue]--;
		if(this._occ[previousValue] == 0) {
			delete this._occ[previousValue];
			var val = previousValue;
			if(this.min == previousValue) {
				while(!(val in this._occ)) val++;
				this.min = val;
			}
			if(this.max == previousValue) {
				while(!(val in this._occ)) val--;
				this.max = val;
			}
		}
	}
}

StatisticsHolder.prototype.addMember = function(value) {
	this.sampleSize++;
	this.updateMinAndMax(value);

	this._executeWelfordIteration(value);
}

StatisticsHolder.prototype.editMemberValue = function(newValue, previousValue) {
	this.updateMinAndMax(newValue, previousValue);

	this._executeReverseWelfordIteration(previousValue);
	this._executeWelfordIteration(newValue);
}

/* @Docs
This method executes a single iteration of Welford's
online algorithm for standard deviation calculation.
Ref: 
https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Online_algorithm
 */
StatisticsHolder.prototype._executeWelfordIteration = function(val) {
	if(this.sampleSize == 1) {
		this.M = val;
		this.S = 0;
	}
	else {
		var old_M = this.M;
		this.M = old_M + (val - old_M)/this.sampleSize;
		this.S = this.S + (val - old_M)*(val - this.M);
	}
}

/* @Docs
This method executes a reverse iteration of Welford's
online algorithm for standard deviation calculation.
Not existing in the original source, implemented here
to provide functionality of editing member values. 
*/
StatisticsHolder.prototype._executeReverseWelfordIteration = function(val) {
	if(this.sampleSize == 1) {
		this.M = val;
		this.S = 0;
	}
	else {
		var last_M = this.M;
		this.M = (last_M*this.sampleSize - val)/(this.sampleSize-1);
		this.S = this.S - (val - this.M)*(val - last_M);
	}
}
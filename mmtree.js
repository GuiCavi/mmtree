/**
 * Consts
 */
var Region = {};
Object.defineProperty(Region, 'I',  {
	enumerable: false,
  configurable: false,
  writable: false,
  value: 0
});

Object.defineProperty(Region, 'II',  {
	enumerable: false,
  configurable: false,
  writable: false,
  value: 1
});

Object.defineProperty(Region, 'III',  {
	enumerable: false,
  configurable: false,
  writable: false,
  value: 2
});

Object.defineProperty(Region, 'IV',  {
	enumerable: false,
  configurable: false,
  writable: false,
  value: 3
});

Object.defineProperty(Region, 'NONE',  {
	enumerable: false,
  configurable: false,
  writable: false,
  value: -1
});

/**
 * Singleton for configurations
 */
var Config = (function() {
	var instance;

	function Config() {
		this.distanceFunction = Distance.euclidianDistance;
		this.extractorFunction = Extractor.euclidianExtractor;
		this.calculateBestPivots = Policy.simplePivotChoose;

		return instance;
	}

	/**
	 * Singleton methods
	 * @return This class instance
	 */
	Config.getInstance = function() {
		if (!instance) instance = createInstance();
		return instance;
	};

	function createInstance() {
		var obj = new Config();
		return obj;
	};

	return Config;
})();

/**
 * Namespace for computing distances
 */
var Distance = {
  euclidianDistance: function(a, b) {
  	return Math.sqrt(Math.pow(a.x + b.x, 2) + Math.pow(a.y + b.y, 2));
  }
};

/**
 * Namespace for extract characteristics
 */
var Extractor = {
	euclidianExtractor: function(a) {
		return a;
	}
}

/**
 * Policies
 */
var Policy = {
	simplePivotChoose: function(data) {
		return [data[0], data[1]];
	}
}

/**
 * Node class
 */
var Node = (function() {
	'use strict';

	function Node() {
		this.pivots = new Array(2+1).join('0').split('').map(parseFloat);
		this.regions = new Array(4+1).join('0').split('').map(parseFloat);
		this.distancesToParents = new Array(4+1).join('0').split('').map(parseFloat);

		this.distanceBetweenPivots = 0;

		this.pivots.forEach((el, i) => {
			this.pivots[i] = null;
		});

		this.regions.forEach((el, i) => {
			this.regions[i] = null;
		});
	}

	Node.prototype.getPivots = function() {
		return this.pivots;
	}

	Node.prototype.addVector = function(vector, dist0, dist1) {
		var isFull = this.isNodeFullOfPivots();

		if (!isFull.full) {
			this.pivots[isFull.index] = vector;
			this.distancesToParents[2*isFull.index] = dist0;
			this.distancesToParents[2*isFull.index+1] = dist1;
		}
		else {
			var dist0 = Config.getInstance().distanceFunction(this.pivots[0], vector),
					dist1 = Config.getInstance().distanceFunction(this.pivots[1], vector);

			var region = Region.NONE;

			if (dist0 < this.distanceBetweenPivots && dist1 < this.distanceBetweenPivots)
				// ADD ON INTERSECTION (Region I)
				region = Region.I;
			else if (dist0 < this.distanceBetweenPivots && dist1 >= this.distanceBetweenPivots)
				// ADD ON Region II
				region = Region.II;
			else if (dist0 >= this.distanceBetweenPivots && dist1 < this.distanceBetweenPivots)
				// ADD ON Region III
				region = Region.III;
			else if (dist0 >= this.distanceBetweenPivots && dist1 >= this.distanceBetweenPivots)
				// ADD OUTSIDE (Region IV)
				region = Region.IV;

			if (this.regions[region] == null)
				this.regions[region] = new Node();

			this.regions[region].addVector(vector, dist0, dist1);
		}

		isFull = this.isNodeFullOfPivots();
		if (isFull.full) {
			this.calculateDistanceBetweenPivots();
		}
	}

	/**
	 * Calculate the distance between pivots in this node
	 */
	Node.prototype.calculateDistanceBetweenPivots = function() {
		this.distanceBetweenPivots = Config.getInstance().distanceFunction(this.pivots[0], this.pivots[1]);
	}

	/**
	 * Verify if the node is full
	 * @return {Object} An object containing if the node is full and the index
	 */
	Node.prototype.isNodeFullOfPivots = function() {
		var isFull = true;

		for (var i = 0; i < this.pivots.length; i++) {
			if (this.pivots[i] == null) {
				isFull = false;
				break;
			}
		}

		return {
			full: isFull,
			index: i
		};
	}

	Node.prototype.walk = function(options) {
		if (options != undefined && 'callback' in options) {
			options.callback(this);
		}
		for (var i = 0; i < this.regions.length; i++) {

			if (this.regions[i] == null) continue;

			this.regions[i].walk(options);
		}
	}

	return Node;
}());

/**
 * MMTree
 */
var MMTree = (function() {
	'use strict';

	function MMTree() {
		this.root = new Node();
	}

	MMTree.prototype.insert = function(vector) {
		this.root.addVector(vector, 0, 0);
	}

	MMTree.prototype.walk = function(options) {
		this.root.walk(options);
	}

	return MMTree;
}());

// document.addEventListener('DOMContentLoaded', () => {
	// var mmt = new MMTree();

	// var data = [
	// 	{ x: 1, y: 2 },
	// 	{ x: 1, y: 5 },
	// 	{ x: 3, y: 1 },
	// 	{ x: 4, y: 6 },
	// 	{ x: 2, y: 1 },
	// 	{ x: 6, y: 3 },
	// 	{ x: 2, y: 5 },
	// ];

	// var pivots = Config.getInstance().calculateBestPivots(data);

	// console.log(pivots);

	// mmt.insert(Config.getInstance().extractorFunction(pivots[0]));
	// mmt.insert(Config.getInstance().extractorFunction(pivots[1]));

	// for (var i = 2; i < data.length; i++) {
	// 	var vector = Config.getInstance().extractorFunction(data[i]);

	// 	mmt.insert(vector);
	// }

	// console.log(mmt);
// });
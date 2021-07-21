// ok. we got this func
/**
 *
 * @returns {Promise<Offer>}
 */
function getData() {
	let price = Math.floor(Math.random() * 2000);
	let time = Math.random() * 2000;
	console.log("Loading item. Will wait " + time.toFixed(0) + "ms. Price: " + price);
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(new Offer(price));
		}, time);
	});
}

// i like typescript so
class Offer {
	price = 0;
	constructor(price) {
		this.price = price;
	}
}

// let's make some store
class Store {
	state = {};
	mutations = {};
	actions = {};
	subs = [];

	constructor(options) {
		this.state = options.state;
		this.mutations = options.mutations;
		this.actions = options.actions;
	}

	/**
	 *
	 * @param {string} actionName
	 * @param {any} payload
	 */
	dispatch(actionName, payload) {
		if (this.actions[actionName]) {
			const f = this.actions[actionName];
			f.call(this, this, payload);
		} else {
			throw new Error(`Action "${actionName}" is not defined.`);
		}
	}

	/**
	 *
	 * @param {string} commitName
	 * @param {any} payload
	 */
	commit(commitName, payload) {
		if (this.mutations[commitName]) {
			const f = this.mutations[commitName];
			f.call(this, this.state, payload);
			this.intercept(this.state);
		} else {
			throw new Error(`Mutation "${commitName}" is not defined.`);
		}
	}

	/**
	 *
	 * @param {Function} cb
	 * @returns {Object} {unsubscribe()}
	 */
	subscribe(cb) {
		this.subs.push(cb);
		return {
			unsubscribe: this.unsubscribe.bind(this, this.subs.length - 1),
		};
	}
	/**
	 *
	 * @param {number} index
	 */
	unsubscribe(index) {
		this.subs = this.subs.filter((_, i) => i !== index);
	}
	/**
	 *
	 * @param {any} val
	 */
	intercept(val) {
		this.subs.forEach((cb) => {
			cb.call(null, val);
		});
	}
}
// now we got store
// define some initial state
const store = new Store({
	state: {
		summ: 0,
		offers: [],
	},

	mutations: {
		/**
		 * @param {any} state
		 * @param {Offer} offer
		 */
		addOffer(state, offer) {
			state.summ += offer.price;
			state.offers.push(offer);
			state.offers.sort((a, b) => a.price - b.price);
		},
	},
	actions: {
		/**
		 *
		 * @param {Store} ctx
		 * @param {Promise<Offer>} data
		 */
		load(ctx, data) {
			data.then((offer) => {
				ctx.commit("addOffer", offer);
			});
		},
	},
});

/**
 *
 * @param {number} count
 */
function getOffers(count) {
	const num = count;
	const result = store.subscribe((state) => {
		if (state.offers.length === num) {
			console.log(state);
			result.unsubscribe();
		}
	});
	while (count--) {
		store.dispatch("load", getData());
	}
}

// for some reason we want 12 offers.
getOffers(12);

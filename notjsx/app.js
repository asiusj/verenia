class NotJsx {
	src = null;
	res = null;
	available = ["input", "textarea"];
	children = [];

	constructor(options) {
		if (options) {
			this.src = options.src;
			this.res = options.res;
		}
		this.src && this.bind();
		this.src.value && this.import();
	}

	bind(child) {
		if (child) {
			child.addEventListener("input", this.export.bind(this));
		} else {
			this.src.addEventListener("input", this.import.bind(this));
		}
	}

	import() {
		this.res.innerHTML = this.vals(this.src.value);
		this.attach();
	}

	export(e) {
		if (e.target) {
			this.src.value = this.update(e.target.value, e.target.dataset.index);
		}
	}

	vals(srcVal) {
		const regexp = /{{([^:|}]*)(?::?)([^:|}]*)(?:\|?)([^:|}]*)}}/g;
		let pos = 0;
		const res = srcVal.replace(regexp, (init, comp, val, pipe) => {
			if (this.valIsComp(comp)) {
				const newComp = document.createElement(comp);

				newComp.setAttribute("data-index", `${pos}`);
				newComp.value = val;
				this.bind(newComp);
				this.children[pos] = newComp;
				return `<div id="pos-${pos++}"></div>`;
			} else {
				return init;
			}
		});
		return res;
	}

	update(val, index) {
		const regexp = /{{([^:|}]*)(?::?)([^:|}]*)(?:\|?)([^:|}]*)}}/g;
		let pos = 0;
		const res = this.src.value.replace(regexp, (init, comp) => {
			if (pos === parseInt(index)) {
				pos++;
				return `{{${comp}${val ? ":" + val : ""}}}`;
			} else {
				pos++;
				return init;
			}
		});
		return res;
	}

	attach() {
		this.children.forEach((el, i) => {
			const target = document.querySelector("#pos-" + i);
			if (target) {
				this.res.replaceChild(el, target);
			}
		});
	}

	valIsComp(str) {
		return this.available.includes(str);
	}
}

const src = document.getElementById("source-text");
const res = document.getElementById("result-body");

const app = new NotJsx({
	src,
	res,
});

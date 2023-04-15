"use strict";

function rgb(r, g, b) {
	return `rgb(${r}, ${g}, ${b})`;
}

function rgba(r, g, b, a) {
	return `rgb(${r}, ${g}, ${b}, ${a})`;
}

function getRandInt(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

class Canvas {
	constructor() {
		this.element = document.getElementById("canvas");
		this.context = this.element.getContext("2d");
		this.width = this.element.width;
		this.height = this.element.height;
		console.log(this.width);
	}
	
	drawRectES(ex, ey, sx, sy, color, fill) {
		if (fill) {
			this.context.fillStyle = color;
			this.context.fillRect(ex, ey, sx, sy);
		}
		else {
			this.context.strokeStyle = color;
			this.context.strokeRect(ex, ey, sx, sy);
		}
	}
	drawRectEE(e1x, e1y, e2x, e2y, color, fill) {
		this.drawRectES(e1x, e1y, e2x - e1x, e2y - e1y, color, fill);
	}
	clear(color) {
		this.drawRectES(0, 0, this.width, this.height, color, true);
	}
	drawLine(e1x, e1y, e2x, e2y, color) {
		this.context.strokeStyle = color;
		this.context.beginPath();
		this.context.moveTo(e1x, e1y);
		this.context.lineTo(e2x, e2y);
		this.context.stroke();
	}
	drawCircle(x, y, r, color, fill) {
		this.context.beginPath();
		this.context.moveTo(x, y)
		this.context.arc(x, y, r, 0, 2 * Math.PI, true);
		if (fill) {
			this.context.fillStyle = color;
			this.context.fill();
		}
		else {
			this.context.strokeStyle = color;
			this.context.stroke();
		}
	}
	drawText(text, x, y, font, color, fill) {
		this.context.textBaseline = "hanging";
		this.context.font = font;
		if (fill) {
			this.context.fillStyle = color;
			this.context.fillText(text, x, y);
		}
		else {
			this.context.strokeStyle = color;
			this.context.strokeText(text, x, y);
		}
	}
}
const canvas = new Canvas();

class Mouse {
	constructor() {
		this.position = {x: 0, y: 0};
		this.clicked = false;
		this.left = true;
		this.over_canvas = false;
	}
	
	onOverCanvas() {
		this.over_canvas = true;
	}
	onOutCanvas() {
		this.over_canvas = false;
	}
	onMove(event) {
		this.position = {x: event.offsetX, y: event.offsetY};
	}
	onDown() {
		this.clicked = true;
		this.left = true;
	}
	onUp() {
		this.clicked = false;
	}
	onContextmenu() {
		this.left = false;
	}

	isOverCanvas() {
		return this.over_canvas;
	}
	getPosition() {
		return this.position;
	}
	isClicked() {
		return this.clicked;
	}
	isLeft() {
		return this.left;
	}
}
const mouse = new Mouse();
window.addEventListener("mousemove", function(event) {mouse.onMove(event);});
window.addEventListener("mousedown", function() {mouse.onDown();});
window.addEventListener("mouseup", function() {mouse.onUp();});
canvas.element.addEventListener("mouseover", function() {mouse.onOverCanvas();});
canvas.element.addEventListener("mouseout", function() {mouse.onOutCanvas();});
canvas.element.oncontextmenu = function() {mouse.onContextmenu(); return false;};

class Field {
	constructor() {
		this.width = canvas.width;
		this.height = canvas.height;
		this.cell_size = 5;
		this.n_column = this.width / this.cell_size;
		this.n_row = this.height / this.cell_size;
	
		this.cells = [];
		for (let x = 0; x < this.n_column; x++) {
			let column = [];
			for (let y = 0; y < this.n_row; y++) {
				column[y] = false;
			}
			this.cells[x] = column;
		}
	}

	clear() {
		for (let x = 0; x < this.n_column; x++) {
			for (let y = 0; y < this.n_row; y++) {
				this.cells[x][y] = false;
			}
		}
	}

	posToCell(px, py) {
		let cx = Math.floor(px / this.cell_size);
		let cy = Math.floor(py / this.cell_size);

		return {x: cx, y: cy};
	}

	setCell(cx, cy, value) {
		this.cells[cx][cy] = value;
	}

	getCell(cx, cy) {
		switch (control_edge_rule.getValue()) {
		case "loop":
			if (cx < 0) cx += this.n_column;
			if (this.n_column <= cx) cx -= this.n_column;
			if (cy < 0) cy += this.n_row;
			if (this.n_row <= cy) cy -= this.n_row;
			break;
		
		case "dead":
			if (cx < 0 || this.n_column <= cx || cy < 0 || this.n_row <= cy)
				return false;
		}

		return this.cells[cx][cy];
	}

	countAliveCells(cx, cy) {
		let count = 0;
		for (let x = cx - 1; x <= cx + 1; x++) {
			for (let y = cy - 1; y <= cy + 1; y++) {
				if (x == cx && y == cy) continue;
				if (this.getCell(x, y)) count++;
			}
		}
		return count;
	}
	
	nextStep() {
		let next_cells = [];
		for (let x = 0; x < this.n_column; x++) {
			let column = [];
			for (let y = 0; y < this.n_row; y++) {
				column[y] = false;
			}
			next_cells[x] = column;
		}

		for (let x = 0; x < this.n_column; x++) {
			for (let y = 0; y < this.n_row; y++) {
				let n_alive = this.countAliveCells(x, y);
				if (this.cells[x][y]) {
					if (n_alive <= 1 || 4 <= n_alive) next_cells[x][y] = false;
					else next_cells[x][y] = true;
				}
				else if (n_alive == 3) next_cells[x][y] = true;
				else next_cells[x][y] = false;
			}
		}
		this.cells = next_cells.concat();
	}

	draw() {
		canvas.clear(rgb(240, 240, 255));
		for (let x = 0; x < this.n_column; x++) {
			for (let y = 0; y < this.n_row; y++) {
				canvas.drawRectES(x * this.cell_size, y * this.cell_size, this.cell_size, this.cell_size, rgb(180, 180, 255), false);
				if (this.cells[x][y])
					canvas.drawRectES(x * this.cell_size, y * this.cell_size, this.cell_size, this.cell_size, rgb(100, 100, 200), true);
			}
		}
	}
	
}
const field = new Field();

class ControlRun {
	constructor() {
		this.element = document.getElementById("run");
		this.intervalID = 0;
	}

	isChecked() {
		return this.element.checked;
	}

	onChange() {
		if (this.element.checked) {
			window.clearInterval(this.intervalID);
			this.intervalID = window.setInterval(function() {field.nextStep();}, 1000 / control_step_p_sec.getValue());
		}
		else {
			window.clearInterval(this.intervalID);
		}
	}
};
const control_run = new ControlRun();
control_run.element.addEventListener("change", function() {control_run.onChange();})

class ControlStepPSec {
	constructor() {
		this.range_element = document.getElementById("step_p_sec");
		this.value_element = document.getElementById("value");
	}

	getValue() {
		return this.range_element.value;
	}

	onInput() {
		this.value_element.innerHTML = this.range_element.value;
		if (control_run.isChecked()) {
			window.clearInterval(control_run.intervalID);
			control_run.intervalID = window.setInterval(function() {field.nextStep();}, 1000 / control_step_p_sec.getValue());
		}
	}
};
const control_step_p_sec = new ControlStepPSec();
control_step_p_sec.range_element.addEventListener("input", function() {control_step_p_sec.onInput();});

class ControlEdgeRule {
	constructor() {
		this.element = document.getElementById("edge_rule");
	}

	getValue() {
		return this.element.value;
	}
};
const control_edge_rule = new ControlEdgeRule();

class ControlReset {
	constructor() {
		this.element = document.getElementById("reset");
	}

	onClick() {
		field.clear();
	}
}
const control_reset = new ControlReset();
control_reset.element.addEventListener("click", function() {control_reset.onClick();});

const fps = 60;

let is_over_canvas;
let position;
let is_clicked;
let is_left;
let cell;

window.addEventListener("DOMContentLoaded", function() {
	window.setInterval(function() {
		is_over_canvas = mouse.isOverCanvas();
		position = mouse.getPosition();
		is_clicked = mouse.isClicked();
		is_left = mouse.isLeft();
		cell = field.posToCell(position.x, position.y);

		if (is_clicked && is_over_canvas) {
			field.setCell(cell.x, cell.y, is_left);
		}

		field.draw();
		canvas.drawText(``, 
			10, 10, "48px serif", rgb(0, 0, 0), true);

	}, 1000 / fps);
});

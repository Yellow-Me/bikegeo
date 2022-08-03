//  This file is part of BikeGeo.
//
//    BikeGeo is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License version 3 
//    as published by the Free Software Foundation.
//
//    BikeGeo is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with BikeGeo.  If not, see <http://www.gnu.org/licenses/>.
//
//  Copyright 2014 Juha Virtakoivu

//	Valentin Chirikov - bike addition, removal, save & load to file

function BikeData() {
	this.name = "Default";
	this.color = "#ff0000";
	this.hta = 71;
	this.htl = 125;
	this.fl = 396;
	this.fo = 47;
	this.bbDrop = 69;
	this.spacers = 35;
	this.sl = 90;
	this.sa = -9;
	this.sta = 74;
	this.ttl = 530;
	this.ws = 622;
	this.csl = 440;
	this.tireSize = 25;
	this.crankLength = 172.5;
	this.toeLength = 100;
}

function BikeGeometryCalculations() {
	/* Geometry calculations */
	/**
	 * @returns rear axle X position in BB space
	 */
	 this.rearAxle = function () {
		return -Math.sqrt(this.csl * this.csl - this.bbDrop * this.bbDrop);
	}
	/**
	 * @returns front axle X position in BB space
	 */
	this.frontAxle = function () {
		return this.fo / Math.cos(deg2rad(90 - this.hta)) +
			(this.htl + this.fl - this.fo * Math.tan(deg2rad(90 - this.hta))) * Math.cos(deg2rad(this.hta)) +
			this.reach();
	}
	/**
	 * @returns wheelbase of bike
	 */
	this.wheelbase = function () {
		return (this.frontAxle() - this.rearAxle());
	}
	
	this.frontCenter = function() {
		return Math.sqrt(this.bbDrop**2 + this.frontAxle()**2);
	}
	this.rearCenter = function() {
		return Math.sqrt(this.csl**2 - this.bbDrop**2);
	}

	this.frontCenter = function () {
		return Math.sqrt(this.bbDrop ** 2 + this.frontAxle() ** 2);
	}
	this.rearCenter = function () {
		return Math.sqrt(this.csl ** 2 - this.bbDrop ** 2);
	}

	this.reach = function () {
		return this.ttl - this.stack() * Math.tan(deg2rad(90 - this.sta));
	}
	this.reachWithSpacers = function () {
		return this.reach() - this.spacers * Math.cos(deg2rad(this.hta));
	}
	this.reachWithStem = function () {
		// convert stem angle to XY space
		const stemAngleAct = deg2rad(90 - this.hta + this.sa);
		return this.reachWithSpacers() + this.sl * Math.cos(stemAngleAct);
	}

	this.stack = function () {
		return Math.sin(deg2rad(this.hta)) * (this.htl + this.fl - this.fo / Math.tan(deg2rad(this.hta))) + this.bbDrop;
	}
	this.stackWithSpacers = function () {
		return this.stack() + this.spacers * Math.sin(deg2rad(this.hta));
	}
	this.stackWithStem = function () {
		// convert stem angle to XY space
		const stemAngleAct = deg2rad(90 - this.hta + this.sa);
		return this.stackWithSpacers() - this.sl * Math.sin(-stemAngleAct);
	}

	this.mechanicalTrail = function () {
		return this.wheelAndTireRadius() * Math.sin(deg2rad(90 - this.hta)) - this.fo;
	}
	this.groundTrail = function () {
		return this.wheelAndTireRadius() / Math.tan(deg2rad(this.hta)) - this.fo / Math.sin(deg2rad(this.hta));
	}
	this.rearWheelTrail = function () {
		return this.wheelbase() * Math.sin(deg2rad(this.hta)) + this.mechanicalTrail();
	}
	this.wheelAndTireRadius = function () {
		return (this.ws + this.tireSize) / 2;
	}
	this.toeOverlap = function () {
		return Math.max(0, this.crankLength + this.wheelAndTireRadius() - Math.sqrt((this.frontAxle() - this.toeLength) ** 2 + this.bbDrop ** 2));
	}
}

function BikeGraphics() {
	this.drawBike = function () {
		// hack to reset canvas
		this.context.canvas.width += 0;
		
		const ttY = BB[1] - this.stack() * mm2px; // Y coordinate of top tube
		const seatX = BB[0] - (this.ttl - this.reach()) * mm2px; // X of top of seat tube
		const axleY = BB[1] - this.bbDrop * mm2px; // Y coordinate of axles
		const rearAxle = this.rearAxle() * mm2px + BB[0]; // X of rear axle
		const frontAxle = this.frontAxle() * mm2px + BB[0]; // X of front axle

		// upper end of fork
		const forkTX = BB[0] + (this.reach() + this.htl * Math.cos(deg2rad(this.hta))) * mm2px;
		const forkTY = ttY + this.htl * Math.sin(deg2rad(this.hta)) * mm2px;

		// Drawing starts.
		// front triangle
		this.context.moveTo(BB[0], BB[1]); // start from bottom bracket
		this.context.lineTo(seatX, ttY); // seat tube
		this.context.lineTo(BB[0] + this.reach() * mm2px, ttY); // top tube
		this.context.lineTo(forkTX, forkTY) // head tube
		this.context.lineTo(BB[0], BB[1]); // down tube

		// rear triangle
		this.context.lineTo(rearAxle, axleY); // chainstay
		this.context.lineTo(seatX, ttY); // seat tube

		// fork
		this.context.moveTo(forkTX, forkTY);
		this.context.lineTo(frontAxle, axleY);

		// stem and spacers
		this.context.moveTo(BB[0] + this.reach() * mm2px, ttY); // top tube
		this.context.lineTo(BB[0] + this.reachWithSpacers() * mm2px, BB[1] - this.stackWithSpacers() * mm2px);
		this.context.lineTo(BB[0] + this.reachWithStem() * mm2px, BB[1] - this.stackWithStem() * mm2px);

		this.context.strokeStyle = this.color;
		this.context.lineWidth = 2;
		this.context.stroke();

		// rear wheel
		this.context.lineWidth = 1;
		this.context.fillStyle = "rgba(0,0,0,0.1)"
		this.context.beginPath();
		this.context.arc(rearAxle, axleY, this.ws / 2 * mm2px, 0, 2 * Math.PI)
		this.context.arc(rearAxle, axleY, this.wheelAndTireRadius() * mm2px, 0, 2 * Math.PI)
		this.context.fill();
		this.context.stroke();

		// front wheel
		this.context.beginPath();
		this.context.arc(frontAxle, axleY, this.ws / 2 * mm2px, 0, 2 * Math.PI)
		this.context.arc(frontAxle, axleY, this.wheelAndTireRadius() * mm2px, 0, 2 * Math.PI)
		this.context.fill();
		this.context.stroke();

		this.context.fillStyle = "rgba(128,0,128,0.1)"
		this.context.setLineDash([5, 5])
		this.context.beginPath();
		this.context.arc(BB[0], BB[1], this.crankLength * mm2px, 0, 2 * Math.PI)
		this.context.fill();
		this.context.stroke();
		// Front of toe
		this.context.setLineDash([1, 5])
		this.context.beginPath();
		this.context.arc(BB[0] + this.toeLength * mm2px, BB[1], this.crankLength * mm2px, -Math.PI / 4, Math.PI / 4)
		this.context.stroke();
	}
}

Bike.prototype = new BikeData();

const uid = () =>
  String(
    Date.now().toString(32) +
      Math.random().toString(16)
  ).replace(/\./g, '')


// class handling stack and reach calculations and drawing of bikes
function Bike(id, cvs, form) {

	if(id) { 
		this.id = id; 
	} else {
		this.id = uid();
	}
	
	this.context = cvs.getContext("2d");

	// extend from bike data, calulations, graphics
	BikeData.call(this);
	BikeGeometryCalculations.call(this);
	BikeGraphics.call(this);

	this.data = Object.getPrototypeOf(this);

	// update the form
	this.updateFormReach = function () {
		// update outputs to form
		form.reach.value = this.reach().toFixed(numOfDec);
		form.reachWspc.value = (this.reachWithSpacers()).toFixed(numOfDec);
		form.reachWstm.value = (this.reachWithStem()).toFixed(numOfDec);
	}

	// update the form
	this.updateFormStack = function () {
		// update outputs to form
		form.stack.value = this.stack().toFixed(numOfDec);
		form.stackWspc.value = (this.stackWithSpacers()).toFixed(numOfDec);
		form.stackWstm.value = (this.stackWithStem()).toFixed(numOfDec);
	}

	// update the form
	this.updateFormTrail = function () {
		// update outputs to form
		form.toeOvlp.value = (this.toeOverlap()).toFixed(numOfDec);
		form.groundTrail.value = (this.groundTrail()).toFixed(numOfDec);
		form.mechTrail.value = (this.mechanicalTrail()).toFixed(numOfDec);
	}

	// update callback for data
	this.update = function () {
		// update values from form
		this.name = form.name.value;
		this.ws = Number(form.ws.value);
		this.csl = Number(form.csl.value);
		this.sta = Number(form.sta.value);
		this.hta = Number(form.hta.value);
		this.htl = Number(form.htl.value);
		this.ttl = Number(form.ttl.value);
		this.fl = Number(form.fl.value);
		this.fo = Number(form.fo.value);
		this.bbDrop = Number(form.bbDrop.value);
		this.spacers = Number(form.spacers.value);
		this.sl = Number(form.sl.value);
		this.sa = Number(form.sa.value);
		this.toeLength = Number(form.toeLength.value);
		this.crankLength = Number(form.crankLength.value);
		this.tireSize = Number(form.tireSize.value);
		this.color = form.color.value;

		// calculate stack and reach. Reach calculation uses stack value.
		this.updateFormReach(form);
		this.updateFormStack(form);
		this.updateFormTrail(form);

		// clear canvas and redraw the bike
		this.drawBike();
		 // save bike data to local storage
		this.saveBike();

		// update wheelbase, which is calculated in drawing function
		form.wb.value = (this.wheelbase()).toFixed(numOfDec);
		form.frontCenter.value = this.frontCenter().toFixed(numOfDec);
		form.rearCenter.value = this.rearCenter().toFixed(numOfDec);
	}

	// function to save data to local storage
	this.saveBike = function () {
		const entries = Object.entries(this).filter( ([key, _value]) => { return key in this.data });
		localStorage.setItem(this.id, JSON.stringify(Object.fromEntries(entries)));
	}	

	this.saveBikeToFile = function () {
		this.saveBike();
		const a = document.createElement("a");
		const file = new Blob([localStorage.getItem(this.id)], {type: "application/json"});
		a.href = URL.createObjectURL(file);
		a.download = "bike_" + this.name;
		a.click();
	}
	
	// function to load saved data from local storage
	this.loadSavedData = function () {
		// if something isn't stored, bike data defaults are used
		if(localStorage.getItem(this.id)) {
			const data = JSON.parse(localStorage.getItem(this.id));
			for (const prop in data) { this[prop] = data[prop]; }
		}
	}	

	// function to load saved file data
	this.loadBikeFromFile = function () {
		const files = form.loadHidden.files;
		if(files.length > 0) {
			const file = files[0];
			file.text()
				.then((value) => { 
					localStorage.setItem(this.id, value); 
					this.loadSavedData(); 
					this.updateForm();})
				.catch((err) => { 
					console.log(err); 
					alert("Error loading bike data, check web console log for details !"); });			
		}
	}

	// function for update form data from model
	this.updateForm = function() {
		Object.getOwnPropertyNames(this.data).forEach(
			(propertyName) => { form[propertyName].value = this[propertyName]; }, this
		);		
	}

	this.remove = function() {
		const bikeIds = [];
		bikes.forEach((bike) => {if(bike !== this) bikeIds.push(bike.id)});
		localStorage.setItem("bikeIds", JSON.stringify(bikeIds));
		location.reload();
	}

	// load bike data from local storage
	this.loadSavedData();
}

// add new bike
function addBike(id, bikes) {
	const index = bikes.length;
	const newBikeForm = addForm(index);
	const newCanvas = addCanvas(index);

	// add column header
	addCell(row_bikes, "th", "input", "input",
		{name: "name", form: newBikeForm.id, type: "text", value : "Bike " + index, onChange : "bikes[" + index + "].update()"});
	// wheel size
	addCell(row_ws, "td", "input", "input",
		{name: "ws", form: newBikeForm.id, type: "number", min : 0, max : 700, onChange : "bikes[" + index + "].update()"});
	// tire size
	addCell(row_tireSize, "td", "input", "input",
		{name: "tireSize", form: newBikeForm.id, type: "number", min : 0, max : 200, onChange : "bikes[" + index + "].update()"});
	// bottom bracket drop
	addCell(row_bbDrop, "td", "input", "input",
		{name: "bbDrop", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});	
	// fort length
	addCell(row_fl, "td", "input", "input",
		{name: "fl", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});	
	// fork offset
	addCell(row_fo, "td", "input", "input",
		{name: "fo", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});
	addCell(row_ttl, "td", "input", "input",
		{name: "ttl", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});
	addCell(row_htl, "td", "input", "input",
		{name: "htl", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});
	addCell(row_hta, "td", "input", "input",
		{name: "hta", form: newBikeForm.id, type: "number", step : 0.1, min : -90, max : 90, onChange : "bikes[" + index + "].update()"});
	addCell(row_sta, "td", "input", "input",
		{name: "sta", form: newBikeForm.id, type: "number", step : 0.1, min : -90, max : 90, onChange : "bikes[" + index + "].update()"});
	addCell(row_csl, "td", "input", "input",
		{name: "csl", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});
	addCell(row_spacers, "td", "input", "input",
		{name: "spacers", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});
	addCell(row_sl, "td", "input", "input",
		{name: "sl", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});
	addCell(row_sa, "td", "input", "input",
		{name: "sa", form: newBikeForm.id, type: "number", min : -90, max : 90, onChange : "bikes[" + index + "].update()"});
	addCell(row_toeLength, "td", "input", "input",
		{name: "toeLength", form: newBikeForm.id, type: "number", min : 0, max : 200, onChange : "bikes[" + index + "].update()"});
	addCell(row_crankLength, "td", "input", "input",
		{name: "crankLength", form: newBikeForm.id, type: "number", step : 0.5, min : 100, max : 250, onChange : "bikes[" + index + "].update()"});
	addCell(row_wb, "td", "output", "output", {name: "wb", form: newBikeForm.id});
	addCell(row_frontCenter, "td", "output", "output", {name: "frontCenter", form: newBikeForm.id});
	addCell(row_rearCenter, "td", "output", "output", {name: "rearCenter", form: newBikeForm.id});
	addCell(row_toeOvlp, "td", "output", "output", {name: "toeOvlp", form: newBikeForm.id});
	addCell(row_groundTrail, "td", "output", "output", {name: "groundTrail", form: newBikeForm.id});
	addCell(row_mechTrail, "td", "output", "output", {name: "mechTrail", form: newBikeForm.id});
	addCell(row_reach, "td", "output", "output", {name: "reach", form: newBikeForm.id});
	addCell(row_stack, "td", "output", "output", {name: "stack", form: newBikeForm.id});
	addCell(row_reachWspc, "td", "output", "output", {name: "reachWspc", form: newBikeForm.id});
	addCell(row_stackWspc, "td", "output", "output", {name: "stackWspc", form: newBikeForm.id});
	addCell(row_reachWstm, "td", "output", "output", {name: "reachWstm", form: newBikeForm.id});
	addCell(row_stackWstm, "td", "output", "output", {name: "stackWstm", form: newBikeForm.id});
	addCell(row_color, "td", "input", "input",
		{name: "color", form: newBikeForm.id, type: "color", onChange : "bikes[" + index + "].update()"});

	const controlsCell = document.createElement("td");
	
	const saveButton = document.createElement("input");
	saveButton.setAttribute('name', "save");
	saveButton.setAttribute('value', "Save");
	saveButton.setAttribute('type', "button");
	saveButton.setAttribute('form', newBikeForm.id);
	saveButton.setAttribute('onclick', "bikes[" + index + "].saveBikeToFile()");

	const loadHiddenButton = document.createElement("input");
	loadHiddenButton.setAttribute('name', "loadHidden");
	loadHiddenButton.setAttribute('type', "file");
	loadHiddenButton.setAttribute('form', newBikeForm.id);
	loadHiddenButton.setAttribute('style', "display: none;");
	loadHiddenButton.setAttribute('accept', "application/json");
	loadHiddenButton.setAttribute('onchange', "bikes[" + index + "].loadBikeFromFile()");

	const loadButton = document.createElement("input");
	loadButton.setAttribute('name', "load");
	loadButton.setAttribute('type', "button");
	loadButton.setAttribute('value', "Load");
	loadButton.setAttribute('form', newBikeForm.id);
	loadButton.setAttribute('onclick', `${newBikeForm.id}.loadHidden.click()`);

	const removeButton = document.createElement("input");
	removeButton.setAttribute('name', "remove");
	removeButton.setAttribute('type', "button");
	removeButton.setAttribute('value', "Del");
	removeButton.setAttribute('form', newBikeForm.id);
	removeButton.setAttribute('onclick', "bikes[" + index + "].remove()");

	row_controls.appendChild(controlsCell);
	controlsCell.appendChild(saveButton);		
	controlsCell.appendChild(loadHiddenButton);		
	controlsCell.appendChild(loadButton);		
	controlsCell.appendChild(removeButton);		

	const newBike = new Bike(id, newCanvas, newBikeForm);
	newBike.updateForm();	
	newBike.update();
	bikes.push(newBike);

	const bikeIds = [];
	bikes.forEach((bike) => {bikeIds.push(bike.id)});
	localStorage.setItem("bikeIds", JSON.stringify(bikeIds));
}

// add new virtual bike form
function addForm(index) {
	const newBikeForm = document.createElement("form");
	newBikeForm.id = "bikeForm" + index;

	bikeForms.appendChild(newBikeForm);

	return newBikeForm;
}

// add new canvas
function addCanvas(index) {
	const canvases = document.getElementById("canvases");
	const newCanvas = document.createElement("canvas");
	newCanvas.id = "bike" + index;
	newCanvas.width = 600;
	newCanvas.height = 320;
	newCanvas.className = "bike";
	newCanvas.style = "z-index: " + (index + 1) + ";";

	canvases.appendChild(newCanvas);

	return newCanvas;
}

// add new table cell
function addCell(row, cellTag, cellClass, elementTag, elementOptions) {
	const newCell = document.createElement(cellTag);
	newCell.className = cellClass;

	const newElement = document.createElement(elementTag);

	if(elementOptions) {
		Object.entries(elementOptions).forEach(([key, value]) => { newElement.setAttribute(key, value); });
	}

	row.appendChild(newCell);
	newCell.appendChild(newElement);
}


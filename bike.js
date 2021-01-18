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


// class handling stack and reach calculations and drawing of bikes
function Bike (color,cvs, form) {

	this.color = color;
	this.context = cvs.getContext("2d");
	this.canvas = cvs;

	this.loadSavedData = function () {
		// if something isn't stored, form defaults are used
		if (localStorage.getItem(this.color + "name")) {
			form.name.value = localStorage.getItem(this.color + "name");
		}

		if (localStorage.getItem(this.color + "hta")) {
			form.hta.value = Number(localStorage.getItem(this.color + "hta"));
		}
		if (localStorage.getItem(this.color + "htl")) {
			form.htl.value = Number(localStorage.getItem(this.color + "htl"));

		}
		if (localStorage.getItem(this.color + "fl")) {
			form.fl.value = Number(localStorage.getItem(this.color + "fl"));
		}
		if (localStorage.getItem(this.color + "fo")) {
			form.fo.value = Number(localStorage.getItem(this.color + "fo"));
		}
		if (localStorage.getItem(this.color + "bbDrop")) {
			form.bbDrop.value = Number(localStorage.getItem(this.color + "bbDrop"));
		}
		if (localStorage.getItem(this.color + "spacers")) {
			form.spacers.value = Number(localStorage.getItem(this.color + "spacers"));
		}
		if (localStorage.getItem(this.color + "sl")) {
			form.sl.value = Number(localStorage.getItem(this.color + "sl"));
		}
		if (localStorage.getItem(this.color + "sa")) {
			form.sa.value = Number(localStorage.getItem(this.color + "sa"));
		}
		if (localStorage.getItem(this.color + "sta")) {
			form.sta.value = Number(localStorage.getItem(this.color + "sta"));
		}
		if (localStorage.getItem(this.color + "ttl")) {
			form.ttl.value = Number(localStorage.getItem(this.color + "ttl"));
		}
		if (localStorage.getItem(this.color + "ws")) {
			form.ws.value = Number(localStorage.getItem(this.color + "ws"));
		}
		if (localStorage.getItem(this.color + "csl")) {
			form.csl.value = Number(localStorage.getItem(this.color + "csl"));
		}
		if (localStorage.getItem(this.color + "tireSize")) {
			form.tireSize.value = Number(localStorage.getItem(this.color + "tireSize"));
		}
		if (localStorage.getItem(this.color + "crankLength")) {
			form.crankLength.value = Number(localStorage.getItem(this.color + "crankLength"));
		}
		if (localStorage.getItem(this.color + "toeLength")) {
			form.toeLength.value = Number(localStorage.getItem(this.color + "toeLength"));
		}
	}

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
		return Math.sin(deg2rad(this.hta)) * (this.htl + this.fl - this.fo * Math.cos(deg2rad(this.hta))) + this.bbDrop;
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
	this.drawBike = function () {
		//this.canvas.clearRect(0,0, this.canvas.width, this.canvas.height);
		this.canvas.width = this.canvas.width;
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

		this.saveBike(); // saves bike data to local storage
	}

	// update the form
	this.updateFormReach = function (form) {
		// update outputs to form
		form.reach.value = this.reach().toFixed(numOfDec);
		form.reachWspc.value = (this.reachWithSpacers()).toFixed(numOfDec);
		form.reachWstm.value = (this.reachWithStem()).toFixed(numOfDec);
	}

	// update the form
	this.updateFormStack = function (form) {
		// update outputs to form
		form.stack.value = this.stack().toFixed(numOfDec);
		form.stackWspc.value = (this.stackWithSpacers()).toFixed(numOfDec);
		form.stackWstm.value = (this.stackWithStem()).toFixed(numOfDec);
	}

	// update the form
	this.updateFormTrail = function (form) {
		// update outputs to form
		form.toeOvlp.value = (this.toeOverlap()).toFixed(numOfDec);
		form.groundTrail.value = (this.groundTrail()).toFixed(numOfDec);
		form.mechTrail.value = (this.mechanicalTrail()).toFixed(numOfDec);
	}

	// update callback for data
	this.update = function (form) {
		// update values from form
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

		// calculate stack and reach. Reach calculation uses stack value.
		this.updateFormReach(form);
		this.updateFormStack(form);
		this.updateFormTrail(form);

		// clear canvas and redraw the bike
		this.drawBike();
		// update wheelbase, which is calculated in drawing function
		form.wb.value = (this.wheelbase()).toFixed(numOfDec);
		form.frontCenter.value = this.frontCenter().toFixed(numOfDec);
		form.rearCenter.value = this.rearCenter().toFixed(numOfDec);
	}

	// update callback for bike name
	this.saveName = function (form) {
		// save bike name to local storage
		if (typeof (Storage) !== "undefined") {
			localStorage.setItem(this.color + "name", form.name.value);
		}
		// else do nothing
	}

	// function for saving bike data(except name) to local storage
	this.saveBike = function () {
		if (typeof (Storage) !== "undefined") {
			localStorage.setItem(this.color + "hta", this.hta);
			localStorage.setItem(this.color + "htl", this.htl);
			localStorage.setItem(this.color + "fl", this.fl);
			localStorage.setItem(this.color + "fo", this.fo);
			localStorage.setItem(this.color + "bbDrop", this.bbDrop);
			localStorage.setItem(this.color + "spacers", this.spacers);
			localStorage.setItem(this.color + "sl", this.sl);
			localStorage.setItem(this.color + "sa", this.sa);
			localStorage.setItem(this.color + "sta", this.sta);
			localStorage.setItem(this.color + "ttl", this.ttl);
			localStorage.setItem(this.color + "ws", this.ws);
			localStorage.setItem(this.color + "csl", this.csl);
			localStorage.setItem(this.color + "tireSize", this.tireSize);
			localStorage.setItem(this.color + "crankLength", this.crankLength);
			localStorage.setItem(this.color + "toeLength", this.toeLength);
		}
		// else do nothing
	}

	// load bike data from local storage
	if (typeof (Storage) !== "undefined") {
		this.loadSavedData();
	}
}
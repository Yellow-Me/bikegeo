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
	this.bikeMath = new BikeGeometry();

	this.loadSavedData = function () {
		// if something isn't stored, form defaults are used
		if (localStorage.getItem(this.color + "name")) {
			form.name.value = localStorage.getItem(this.color + "name");
		}

		if (localStorage.getItem(this.color + "headTubeAngle")) {
			form.headTubeAngle.value = Number(localStorage.getItem(this.color + "headTubeAngle"));
		}
		if (localStorage.getItem(this.color + "headTubeLength")) {
			form.headTubeLength.value = Number(localStorage.getItem(this.color + "headTubeLength"));

		}

		if (localStorage.getItem(this.color + "forkLength")) {
			form.forkLength.value = Number(localStorage.getItem(this.color + "forkLength"));
		}
		if (localStorage.getItem(this.color + "forkOffset")) {
			form.forkOffset.value = Number(localStorage.getItem(this.color + "forkOffset"));
		}
		if (localStorage.getItem(this.color + "alternatForkLength")) {
			form.forkLength.value = Number(localStorage.getItem(this.color + "alternatForkLength"));
		}
		if (localStorage.getItem(this.color + "alternateForkOffset")) {
			form.forkOffset.value = Number(localStorage.getItem(this.color + "alternateForkOffset"));
		}

		if (localStorage.getItem(this.color + "bbDrop")) {
			form.bbDrop.value = Number(localStorage.getItem(this.color + "bbDrop"));
		}
		if (localStorage.getItem(this.color + "spacers")) {
			form.spacers.value = Number(localStorage.getItem(this.color + "spacers"));
		}
		if (localStorage.getItem(this.color + "stemLength")) {
			form.stemLength.value = Number(localStorage.getItem(this.color + "stemLength"));
		}
		if (localStorage.getItem(this.color + "stemAngle")) {
			form.stemAngle.value = Number(localStorage.getItem(this.color + "stemAngle"));
		}
		if (localStorage.getItem(this.color + "seatTubeAngle")) {
			form.seatTubeAngle.value = Number(localStorage.getItem(this.color + "seatTubeAngle"));
		}
		if (localStorage.getItem(this.color + "topTubeLength")) {
			form.topTubeLength.value = Number(localStorage.getItem(this.color + "topTubeLength"));
		}
		if (localStorage.getItem(this.color + "wheelSize")) {
			form.wheelSize.value = Number(localStorage.getItem(this.color + "wheelSize"));
		}
		if (localStorage.getItem(this.color + "chainstayLength")) {
			form.chainstayLength.value = Number(localStorage.getItem(this.color + "chainstayLength"));
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

	this.drawBike = function () {
		//this.canvas.clearRect(0,0, this.canvas.width, this.canvas.height);
		this.canvas.width = this.canvas.width;
		const ttY = BB[1] - this.bikeMath.stack() * mm2px; // Y coordinate of top tube
		const seatX = BB[0] - (this.bikeMath.topTubeLength - this.bikeMath.reach()) * mm2px; // X of top of seat tube
		const axleY = BB[1] - this.bikeMath.bbDrop * mm2px; // Y coordinate of axles
		const rearAxle = this.bikeMath.rearAxle() * mm2px + BB[0]; // X of rear axle
		const frontAxle = this.bikeMath.frontAxle() * mm2px + BB[0]; // X of front axle

		// upper end of fork
		const forkTX = BB[0] + (this.bikeMath.reach() + this.bikeMath.headTubeLength * Math.cos(deg2rad(this.bikeMath.headTubeAngle))) * mm2px;
		const forkTY = ttY + this.bikeMath.headTubeLength * Math.sin(deg2rad(this.bikeMath.headTubeAngle)) * mm2px;

		// Drawing starts.
		// front triangle
		this.context.moveTo(BB[0], BB[1]); // start from bottom bracket
		this.context.lineTo(seatX, ttY); // seat tube
		this.context.lineTo(BB[0] + this.bikeMath.reach() * mm2px, ttY); // top tube
		this.context.lineTo(forkTX, forkTY) // head tube
		this.context.lineTo(BB[0], BB[1]); // down tube

		// rear triangle
		this.context.lineTo(rearAxle, axleY); // chainstay
		this.context.lineTo(seatX, ttY); // seat tube

		// fork
		this.context.moveTo(forkTX, forkTY);
		this.context.lineTo(frontAxle, axleY);

		// stem and spacers
		this.context.moveTo(BB[0] + this.bikeMath.reach() * mm2px, ttY); // top tube
		this.context.lineTo(BB[0] + this.bikeMath.reachWithSpacers() * mm2px, BB[1] - this.bikeMath.stackWithSpacers() * mm2px);
		this.context.lineTo(BB[0] + this.bikeMath.reachWithStem() * mm2px, BB[1] - this.bikeMath.stackWithStem() * mm2px);

		this.context.strokeStyle = this.color;
		this.context.lineWidth = 2;
		this.context.stroke();

		// rear wheel
		this.context.lineWidth = 1;
		this.context.fillStyle = "rgba(0,0,0,0.1)"
		this.context.beginPath();
		this.context.arc(rearAxle, axleY, this.bikeMath.wheelSize / 2 * mm2px, 0, 2 * Math.PI)
		this.context.arc(rearAxle, axleY, this.bikeMath.wheelAndTireRadius() * mm2px, 0, 2 * Math.PI)
		this.context.fill();
		this.context.stroke();

		// front wheel
		this.context.beginPath();
		this.context.arc(frontAxle, axleY, this.bikeMath.wheelSize / 2 * mm2px, 0, 2 * Math.PI)
		this.context.arc(frontAxle, axleY, this.bikeMath.wheelAndTireRadius() * mm2px, 0, 2 * Math.PI)
		this.context.fill();
		this.context.stroke();

		this.context.fillStyle = "rgba(128,0,128,0.1)"
		this.context.setLineDash([5, 5])
		this.context.beginPath();
		this.context.arc(BB[0], BB[1], this.bikeMath.crankLength * mm2px, 0, 2 * Math.PI)
		this.context.fill();
		this.context.stroke();
		// Front of toe
		this.context.setLineDash([1, 5])
		this.context.beginPath();
		this.context.arc(BB[0] + this.bikeMath.toeLength * mm2px, BB[1], this.bikeMath.crankLength * mm2px, -Math.PI / 4, Math.PI / 4)
		this.context.stroke();

		this.saveBike(); // saves bike data to local storage
	}

	// update the form
	this.updateForm = function (form) {
		// update outputs to form
		form.reach.value = this.bikeMath.reach().toFixed(numOfDec);
		form.reachWspc.value = (this.bikeMath.reachWithSpacers()).toFixed(numOfDec);
		form.reachWstm.value = (this.bikeMath.reachWithStem()).toFixed(numOfDec);

		// update outputs to form
		form.stack.value = this.bikeMath.stack().toFixed(numOfDec);
		form.stackWspc.value = (this.bikeMath.stackWithSpacers()).toFixed(numOfDec);
		form.stackWstm.value = (this.bikeMath.stackWithStem()).toFixed(numOfDec);

		// update outputs to form
		form.toeOvlp.value = (this.bikeMath.toeOverlap()).toFixed(numOfDec);
		form.groundTrail.value = (this.bikeMath.groundTrail()).toFixed(numOfDec);
		form.mechTrail.value = (this.bikeMath.mechanicalTrail()).toFixed(numOfDec);

		form.wb.value = (this.bikeMath.wheelbase()).toFixed(numOfDec);
		form.frontCenter.value = this.bikeMath.frontCenter().toFixed(numOfDec);
		form.rearCenter.value = this.bikeMath.rearCenter().toFixed(numOfDec);
		form.effectiveSafeDescentAngle.value = this.bikeMath.effectiveSafeDecentAngle().toFixed(numOfDec);
	}

	// update callback for data
	this.update = function (form) {
		// update values from form
		this.bikeMath.wheelSize = Number(form.wheelSize.value);
		this.bikeMath.chainstayLength = Number(form.chainstayLength.value);
		this.bikeMath.seatTubeAngle = Number(form.seatTubeAngle.value);
		this.bikeMath.headTubeAngle = Number(form.headTubeAngle.value);
		this.bikeMath.headTubeLength = Number(form.headTubeLength.value);
		this.bikeMath.topTubeLength = Number(form.topTubeLength.value);
		this.bikeMath.fork = new Fork(Number(form.forkLength.value), Number(form.forkOffset.value));
		this.bikeMath.alternateFork = new Fork(Number(form.alternateForkLength.value), Number(form.alternateForkOffset.value));
		this.bikeMath.bbDrop = Number(form.bbDrop.value);
		this.bikeMath.spacers = Number(form.spacers.value);
		this.bikeMath.stemLength = Number(form.stemLength.value);
		this.bikeMath.stemAngle = Number(form.stemAngle.value);
		this.bikeMath.toeLength = Number(form.toeLength.value);
		this.bikeMath.crankLength = Number(form.crankLength.value);
		this.bikeMath.tireSize = Number(form.tireSize.value);

		// calculate stack and reach. Reach calculation uses stack value.
		this.updateForm(form);

		// clear canvas and redraw the bike
		this.drawBike();
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
			localStorage.setItem(this.color + "headTubeAngle", this.bikeMath.headTubeAngle);
			localStorage.setItem(this.color + "headTubeLength", this.bikeMath.headTubeLength);
			localStorage.setItem(this.color + "forkLength", this.bikeMath.fork.forkLength);
			localStorage.setItem(this.color + "forkOffset", this.bikeMath.fork.forkOffset);
			localStorage.setItem(this.color + "alternateForkLength", this.bikeMath.alternateFork.forkLength);
			localStorage.setItem(this.color + "alternateForkOffset", this.bikeMath.alternateFork.forkOffset);
			localStorage.setItem(this.color + "bbDrop", this.bikeMath.bbDrop);
			localStorage.setItem(this.color + "spacers", this.bikeMath.spacers);
			localStorage.setItem(this.color + "stemLength", this.bikeMath.stemLength);
			localStorage.setItem(this.color + "stemAngle", this.bikeMath.stemAngle);
			localStorage.setItem(this.color + "seatTubeAngle", this.bikeMath.seatTubeAngle);
			localStorage.setItem(this.color + "topTubeLength", this.bikeMath.topTubeLength);
			localStorage.setItem(this.color + "wheelSize", this.bikeMath.wheelSize);
			localStorage.setItem(this.color + "chainstayLength", this.bikeMath.chainstayLength);
			localStorage.setItem(this.color + "tireSize", this.bikeMath.tireSize);
			localStorage.setItem(this.color + "crankLength", this.bikeMath.crankLength);
			localStorage.setItem(this.color + "toeLength", this.bikeMath.toeLength);
		}
	}

	this.substituteFork = function() {
		const showAlternateFork = form.useAlternateFork.value;
		// TODO - Lock all angle fields
		form.headTubeAngle.disabled = showAlternateFork;
		form.seatTubeAngle.disabled = showAlternateFork;
		form.bbDrop.disabled = showAlternateFork;
		form.topTubeLength.disabled = showAlternateFork;
		// TODO - Hide initial fork
	}

	// load bike data from local storage
	if (typeof (Storage) !== "undefined") {
		this.loadSavedData();
	}
}
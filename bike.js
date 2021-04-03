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
	this.alternateForkBikeMath = new BikeGeometry();

	this.useAlternateFork = function() {
		return form.useAlternateFork.checked;
	}
	this.selectiveBikeMath = function() {
		if (this.useAlternateFork())
			return this.alternateForkBikeMath;
		else
			return this.bikeMath;
	}

	this.loadDataItem = function (formItem, itemName) {
		const key = this.color + itemName;
		if (localStorage.getItem(key)) {
			formItem.value = Number(localStorage.getItem(key))
		}
	}
	this.loadSavedData = function () {
		// if something isn't stored, form defaults are used
		this.loadDataItem(form.name, "name");

		this.loadDataItem(form.headTubeAngle, "headTubeAngle");
		this.loadDataItem(form.headTubeLength, "headTubeLength");

		this.loadDataItem(form.forkLength, "forkLength");
		this.loadDataItem(form.forkOffset, "forkOffset");
		this.loadDataItem(form.alternateForkLength, "alternateForkLength");
		this.loadDataItem(form.alternateForkOffset, "alternateForkOffset");

		this.loadDataItem(form.bbDrop, "bbDrop");
		this.loadDataItem(form.spacers, "spacers");
		this.loadDataItem(form.stemAngle, "stemAngle");
		this.loadDataItem(form.stemLength, "stemLength");
		this.loadDataItem(form.seatTubeAngle, "seatTubeAngle");
		this.loadDataItem(form.topTubeLength, "topTubeLength");
		this.loadDataItem(form.wheelSize, "wheelSize");
		this.loadDataItem(form.chainstayLength, "chainstayLength");
		this.loadDataItem(form.tireSize, "tireSize");
		this.loadDataItem(form.crankLength, "crankLength");
		this.loadDataItem(form.toeLength, "toeLength");
	}

	this.drawWheel = function (axleX, axleY) {
		this.context.beginPath();
		this.context.arc(axleX, axleY, this.selectiveBikeMath().wheelSize / 2 * mm2px, 0, 2 * Math.PI)
		this.context.arc(axleX, axleY, this.selectiveBikeMath().wheelAndTireRadius() * mm2px, 0, 2 * Math.PI)
		this.context.fill();
		this.context.stroke();
	}
	this.drawFrame = function () {
		// This exploits a refresh side effect
		this.canvas.width = this.canvas.width;

		this.drawBike(this.bikeMath, this.color, [1, 0]);
		if (this.useAlternateFork())
			this.drawBike(this.alternateForkBikeMath, this.color, [0.5, 0.5]);
	}
	this.drawBike = function (bike, color, lineDash) {
		const ttY = BB[1] - bike.stack() * mm2px; // Y coordinate of top tube
		const seatX = BB[0] - (bike.topTubeLength - bike.reach()) * mm2px; // X of top of seat tube
		const axleY = BB[1] - bike.bbDrop * mm2px; // Y coordinate of axles
		const rearAxle = bike.rearAxle() * mm2px + BB[0]; // X of rear axle
		const frontAxle = bike.frontAxle() * mm2px + BB[0]; // X of front axle

		// upper end of fork
		const forkTX = BB[0] + (bike.reach() + bike.headTubeLength * Math.cos(deg2rad(bike.headTubeAngle))) * mm2px;
		const forkTY = ttY + bike.headTubeLength * Math.sin(deg2rad(bike.headTubeAngle)) * mm2px;

		// Drawing starts.
		// front triangle
		this.context.moveTo(BB[0], BB[1]); // start from bottom bracket
		this.context.lineTo(seatX, ttY); // seat tube
		this.context.lineTo(BB[0] + bike.reach() * mm2px, ttY); // top tube
		this.context.lineTo(forkTX, forkTY) // head tube
		this.context.lineTo(BB[0], BB[1]); // down tube

		// rear triangle
		this.context.lineTo(rearAxle, axleY); // chainstay
		this.context.lineTo(seatX, ttY); // seat tube

		// fork
		this.context.moveTo(forkTX, forkTY);
		this.context.lineTo(frontAxle, axleY);

		// stem and spacers
		this.context.moveTo(BB[0] + bike.reach() * mm2px, ttY); // top tube
		this.context.lineTo(BB[0] + bike.reachWithSpacers() * mm2px, BB[1] - bike.stackWithSpacers() * mm2px);
		this.context.lineTo(BB[0] + bike.reachWithStem() * mm2px, BB[1] - bike.stackWithStem() * mm2px);

		this.context.strokeStyle = color;
		this.context.lineWidth = 2;
		this.context.setLineDash(lineDash);
		this.context.stroke();

		// front & rear wheels
		this.context.lineWidth = 1;
		this.context.fillStyle = "rgba(0,0,0,0.1)"
		this.drawWheel(rearAxle, axleY);
		this.drawWheel(frontAxle, axleY);

		this.context.fillStyle = "rgba(128,0,128,0.1)"
		this.context.setLineDash([5, 5])
		this.context.beginPath();
		this.context.arc(BB[0], BB[1], bike.crankLength * mm2px, 0, 2 * Math.PI)
		this.context.fill();
		this.context.stroke();
		// Front of toe
		this.context.setLineDash([1, 5])
		this.context.beginPath();
		this.context.arc(BB[0] + bike.toeLength * mm2px, BB[1], bike.crankLength * mm2px, -Math.PI / 4, Math.PI / 4)
		this.context.stroke();
	}

	this.updateForm = function (form) {
		// update outputs to form
		form.reach.value = this.selectiveBikeMath().reach().toFixed(numOfDec);
		form.reachWspc.value = (this.selectiveBikeMath().reachWithSpacers()).toFixed(numOfDec);
		form.reachWstm.value = (this.selectiveBikeMath().reachWithStem()).toFixed(numOfDec);

		// update outputs to form
		form.stack.value = this.selectiveBikeMath().stack().toFixed(numOfDec);
		form.stackWspc.value = (this.selectiveBikeMath().stackWithSpacers()).toFixed(numOfDec);
		form.stackWstm.value = (this.selectiveBikeMath().stackWithStem()).toFixed(numOfDec);

		// update outputs to form
		form.toeOvlp.value = (this.selectiveBikeMath().toeOverlap()).toFixed(numOfDec);
		form.groundTrail.value = (this.selectiveBikeMath().groundTrail()).toFixed(numOfDec);
		form.mechTrail.value = (this.selectiveBikeMath().mechanicalTrail()).toFixed(numOfDec);

		form.wb.value = (this.selectiveBikeMath().wheelbase()).toFixed(numOfDec);
		form.frontCenter.value = this.selectiveBikeMath().frontCenter().toFixed(numOfDec);
		form.rearCenter.value = this.selectiveBikeMath().rearCenter().toFixed(numOfDec);
		form.effectiveSafeDescentAngle.value = this.selectiveBikeMath().effectiveSafeDecentAngle().toFixed(numOfDec);
	}
	this.updateBikeParameters = function (bike) {
		bike.wheelSize = Number(form.wheelSize.value);
		bike.chainstayLength = Number(form.chainstayLength.value);
		bike.seatTubeAngle = Number(form.seatTubeAngle.value);
		bike.headTubeAngle = Number(form.headTubeAngle.value);
		bike.headTubeLength = Number(form.headTubeLength.value);
		bike.topTubeLength = Number(form.topTubeLength.value);
		bike.bbDrop = Number(form.bbDrop.value);
		bike.spacers = Number(form.spacers.value);
		bike.stemLength = Number(form.stemLength.value);
		bike.stemAngle = Number(form.stemAngle.value);
		bike.toeLength = Number(form.toeLength.value);
		bike.crankLength = Number(form.crankLength.value);
		bike.tireSize = Number(form.tireSize.value);
	}
	/**
	 * Callback for updating geometry
	 * @param form
	 */
	this.update = function (form) {
		// update values from form
		this.updateBikeParameters(this.bikeMath);
		this.updateBikeParameters(this.alternateForkBikeMath);
		this.bikeMath.fork = new Fork(Number(form.forkLength.value), Number(form.forkOffset.value));
		this.alternateForkBikeMath.fork = new Fork(Number(form.alternateForkLength.value), Number(form.alternateForkOffset.value));

		// calculate stack and reach. Reach calculation uses stack value.
		this.updateForm(form);
		this.saveBike();
		// clear canvas and redraw the bike
		this.drawFrame();
	}
	/**
	 * Callback for saving bike name
	 * @param form
	 */
	this.saveName = function (form) {
		// save bike name to local storage
		if (typeof (Storage) !== "undefined") {
			localStorage.setItem(this.color + "name", form.name.value);
		}
	}
	/**
	 * Callback for saving bike geometry
	 */
	this.saveBike = function () {
		if (typeof (Storage) !== "undefined") {
			localStorage.setItem(this.color + "headTubeAngle", this.bikeMath.headTubeAngle);
			localStorage.setItem(this.color + "headTubeLength", this.bikeMath.headTubeLength);
			localStorage.setItem(this.color + "forkLength", this.bikeMath.fork.forkLength);
			localStorage.setItem(this.color + "forkOffset", this.bikeMath.fork.forkOffset);
			localStorage.setItem(this.color + "alternateForkLength", this.alternateForkBikeMath.fork.forkLength);
			localStorage.setItem(this.color + "alternateForkOffset", this.alternateForkBikeMath.fork.forkOffset);
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
	/**
	 * Callback for enabling substitute fork visualization
	 */
	this.substituteFork = function() {
		const showAlternateFork = form.useAlternateFork.checked;
		// Lock all angle fields
		form.headTubeAngle.disabled = showAlternateFork;
		form.seatTubeAngle.disabled = showAlternateFork;
		form.bbDrop.disabled = showAlternateFork;
		form.topTubeLength.disabled = showAlternateFork;

		// Solve for the rotated frame
		let rotate_function = (x0) => {
			// Rotate the stock frame, and then add the new fork.
			let rotatedFrame = this.bikeMath.rearAxleToLowerHeadset();
			let frontFork = math.add(rotatedFrame, this.alternateForkBikeMath.lowerHeadsetToFrontAxle());
			frontFork = math.multiply(math.rotationMatrix(deg2rad(x0)), frontFork);
			// Fork Y position
			return frontFork.get([1]);
		}

		let frameAngle = BisectionSearch(rotate_function, -10, 10);
		// With the frame angle, adjust everything.
		this.alternateForkBikeMath.assignRotation(frameAngle);

		// calculate stack and reach. Reach calculation uses stack value.
		this.updateForm(form);
		this.saveBike();
		// clear canvas and redraw the bike
		this.drawFrame();
	}

	// load bike data from local storage
	if (typeof (Storage) !== "undefined") {
		this.loadSavedData();
	}
}
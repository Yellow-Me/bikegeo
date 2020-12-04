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

	// load bike data from local storage
	if (typeof (Storage) !== "undefined") {
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
		// else no local storage available, form defaults will be used


	}

	this.drawBike = function () {
		const ttY = BB[1] - this.stack; // Y coordinate of top tube
		const seatX = BB[0] - (this.ttl - this.reach); // X of top of seat tube
		const axleY = BB[1] - this.bbDrop; // Y coordinate of axles
		this.rearAxle = BB[0] - Math.sqrt(this.csl * this.csl - this.bbDrop * this.bbDrop); // X of rear axle


		this.frontAxle = this.fo / Math.cos((90 - this.hta) / 180 * Math.PI) +
			(this.htl + this.fl - this.fo * Math.tan((90 - this.hta) / 180 * Math.PI)) * Math.cos(this.hta / 180 * Math.PI) +
			this.reach + BB[0]; // X of front axle

		// upper end of fork
		const forkTX = BB[0] + this.reach + this.htl * Math.cos(this.hta / 180 * Math.PI);
		const forkTY = ttY + this.htl * Math.sin(this.hta / 180 * Math.PI);

		// Drawing starts.
		// front triangle
		this.context.moveTo(BB[0], BB[1]); // start from bottom bracket
		this.context.lineTo(seatX, ttY); // seat tube
		this.context.lineTo(BB[0] + this.reach, ttY); // top tube
		this.context.lineTo(forkTX, forkTY) // head tube
		this.context.lineTo(BB[0], BB[1]); // down tube

		// rear triangle
		this.context.lineTo(this.rearAxle, axleY); // chainstay
		this.context.lineTo(seatX, ttY); // seat tube

		// fork
		this.context.moveTo(forkTX, forkTY);
		this.context.lineTo(this.frontAxle, axleY);

		// stem and spacers
		this.context.moveTo(BB[0] + this.reach, ttY); // top tube
		this.context.lineTo(BB[0] + this.reachWspc, BB[1] - this.stackWspc);
		this.context.lineTo(BB[0] + this.reachWstm, BB[1] - this.stackWstm);

		this.context.strokeStyle = this.color;
		this.context.lineWidth = 2;
		this.context.stroke();

		// rear wheel
		this.context.lineWidth = 1;
		this.context.beginPath();
		this.context.arc(this.rearAxle, axleY, this.ws / 2, 0, 2 * Math.PI)
		this.context.stroke();

		// front wheel
		this.context.beginPath();
		this.context.arc(this.frontAxle, axleY, this.ws / 2, 0, 2 * Math.PI)
		this.context.stroke();

		this.saveBike(); // saves bike data to local storage
	}

	// update callback for data affecting to stack
	this.updateStack = function (form) {
		// update values from form
		this.hta = Number(form.hta.value);
		this.htl = Number(form.htl.value) * mm2px;
		this.fl = Number(form.fl.value) * mm2px;
		this.fo = Number(form.fo.value) * mm2px;
		this.bbDrop = Number(form.bbDrop.value) * mm2px;
		this.spacers = Number(form.spacers.value) * mm2px;
		this.sl = Number(form.sl.value) * mm2px;
		this.sa = Number(form.sa.value);

		// calculate stack and reach. Reach calculation uses stack value.
		this.calcStack();
		this.calcReach();

		// update outputs to form
		form.reach.value = (this.reach / mm2px).toFixed(numOfDec);
		form.stack.value = (this.stack / mm2px).toFixed(numOfDec);
		form.reachWspc.value = (this.reachWspc / mm2px).toFixed(numOfDec);
		form.stackWspc.value = (this.stackWspc / mm2px).toFixed(numOfDec);
		form.reachWstm.value = (this.reachWstm / mm2px).toFixed(numOfDec);
		form.stackWstm.value = (this.stackWstm / mm2px).toFixed(numOfDec);

		// clear canvas and redraw the bike
		this.drawBike();
		// update wheelbase, which is calculated in drawing function
		form.wb.value = ((this.frontAxle - this.rearAxle) / mm2px).toFixed(numOfDec);
	}

	// update callback for data affecting to reach
	this.updateReach = function (form) {
		// update values from form
		this.sta = Number(form.sta.value);
		this.ttl = Number(form.ttl.value) * mm2px;
		this.stack = Number(form.stack.value) * mm2px;

		// calculate reach
		this.calcReach();

		// update outputs to form
		form.reach.value = (this.reach / mm2px).toFixed(numOfDec);
		form.reachWspc.value = (this.reachWspc / mm2px).toFixed(numOfDec);
		form.reachWstm.value = (this.reachWstm / mm2px).toFixed(numOfDec);

		// clear canvas and redraw the bike
		this.drawBike()

		// update wheelbase, which is calculated in drawing function
		form.wb.value = ((this.frontAxle - this.rearAxle) / mm2px).toFixed(numOfDec);
	}

	// update callback for data not affecting to stack nor reach
	this.update = function (form) {
		// update values from form
		this.ws = Number(form.ws.value) * mm2px;
		this.reach = Number(form.reach.value) * mm2px;
		this.csl = Number(form.csl.value) * mm2px;

		// clear canvas and redraw the bike
		this.drawBike()

		// update wheelbase, which is calculated in drawing function
		form.wb.value = ((this.frontAxle - this.rearAxle) / mm2px).toFixed(numOfDec);
	}

	// function for calculating stack
	this.calcStack = function () {
		this.stack = Math.sin(this.hta / 180 * Math.PI) * (this.htl + this.fl - this.fo * Math.cos(this.hta / 180 * Math.PI)) + this.bbDrop;
		this.stackWspc = this.stack + this.spacers * Math.sin(this.hta / 180 * Math.PI);

		// convert stem angle to XY space
		const stemAngleAct = (90 - this.hta + this.sa) / 180 * Math.PI;
		this.stackWstm = this.stackWspc - this.sl * Math.sin(-stemAngleAct);

	}

	// function for calculating reach
	this.calcReach = function () {
		this.reach = this.ttl - this.stack * Math.tan((90 - this.sta) / 180 * Math.PI);
		this.reachWspc = this.reach - this.spacers * Math.cos(this.hta / 180 * Math.PI);

		// convert stem angle to XY space
		const stemAngleAct = (90 - this.hta + this.sa) / 180 * Math.PI;
		this.reachWstm = this.reachWspc + this.sl * Math.cos(stemAngleAct);

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
			localStorage.setItem(this.color + "htl", this.htl / mm2px);
			localStorage.setItem(this.color + "fl", this.fl / mm2px);
			localStorage.setItem(this.color + "fo", this.fo / mm2px);
			localStorage.setItem(this.color + "bbDrop", this.bbDrop / mm2px);
			localStorage.setItem(this.color + "spacers", this.spacers / mm2px);
			localStorage.setItem(this.color + "sl", this.sl / mm2px);
			localStorage.setItem(this.color + "sa", this.sa);
			localStorage.setItem(this.color + "sta", this.sta);
			localStorage.setItem(this.color + "ttl", this.ttl / mm2px);
			localStorage.setItem(this.color + "ws", this.ws / mm2px);
			localStorage.setItem(this.color + "csl", this.csl / mm2px);


		}
		// else do nothing
	}
}
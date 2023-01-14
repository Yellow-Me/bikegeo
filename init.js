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

// Some global variables
const BB = [270, 220];
const mm2px = 0.3;
const canvasWidth = 600;
const canvasHeight = 320;
const numOfDec = 0;

// Help toggle function
const ch = document.getElementById("help");
const ctxh = ch.getContext("2d");
let helpTogg = 0;
const ph = document.getElementById("helpPng");

window.onload = function () {
	// set onClick callback to help link
	const hlpLnk = document.getElementById("helpLink");
	hlpLnk.onclick = function () {
		if (helpTogg) {
			ctxh.clearRect(0, 0, canvasWidth, canvasHeight);
			helpTogg = 0;
		} else {
			helpTogg = 1;
			ctxh.drawImage(ph, 0, 0);
		}
	}
}

function deg2rad(deg) {
	return deg / 180 * Math.PI;
}
function rad2deg(rad) {
	return rad * 180 / Math.PI;
}

// bike storage
let bikes = [];

// initialize bikes
if(localStorage.getItem("bikeIds")) {
	const bikeIds = JSON.parse(localStorage.getItem("bikeIds"));
	bikeIds.forEach(id => { addBike(id, bikes);	});
} else {
	addBike(uid(), bikes);
}



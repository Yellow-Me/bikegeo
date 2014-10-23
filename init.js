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
var BB = [270,220];
var mm2px = 0.3;
var canvasWidth = 600;
var canvasHeight = 300;
var numOfDec = 0;

// Help toggle function
var ch =  document.getElementById("help");
var ctxh = ch.getContext("2d");
var helpTogg = 0;
var ph =  document.getElementById("helpPng");

window.onload = function ()
{
    // set onClick callback to help link
    var hlpLnk = document.getElementById("helpLink");
    hlpLnk.onclick = function ()
    {
	if (helpTogg)
	{
	    ctxh.clearRect(0,0,canvasWidth,canvasHeight);
	    helpTogg = 0;
	}
	else
	{
	    helpTogg = 1;
	    ctxh.drawImage(ph,0,0);
	}
    }
}

// initialize bikes
var c1 = document.getElementById("bike1");
redBike = new bike('#ff0000',c1,RedBikeForm);
redBike.updateStack(RedBikeForm);
redBike.updateReach(RedBikeForm);
redBike.update(     RedBikeForm);

var c2 = document.getElementById("bike2");
greBike = new bike('#009900',c2,GreBikeForm);
greBike.updateStack(GreBikeForm);
greBike.updateReach(GreBikeForm);
greBike.update(     GreBikeForm);

var c3 = document.getElementById("bike3");
bluBike = new bike('#0000FF',c3,BluBikeForm);
bluBike.updateStack(BluBikeForm);
bluBike.updateReach(BluBikeForm);
bluBike.update(     BluBikeForm);
 

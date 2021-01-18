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


function Fork(forkLength, forkOffset) {
    this.forkLength = 396;
    this.forkOffset = 47;

    if (arguments.length === 2) {
        this.forkLength = forkLength;
        this.forkOffset = forkOffset;
    }
}

// class handling all the math surrounding bikes
function BikeGeometry () {

    this.defaultValues = function() {
        this.wheelSize = 622;
        this.tireSize = 25;
        this.bbDrop = 69;
        this.fork = new Fork();
        this.alternateFork = new Fork();
        this.topTubeLength = 530;
        this.headTubeLength = 125;
        this.headTubeAngle = 71;
        this.seatTubeAngle = 74;
        this.chainstayLength = 440;
        this.spacers = 35;
        this.stemLength = 90;
        this.stemAngle = -9;
        this.toeLength = 100;
        this.crankLength = 172.5;
    }

    this.forkLength = function() {
        return this.fork.forkLength;
    }
    this.forkOffset = function() {
        return this.fork.forkOffset;
    }

    /* Geometry calculations */
    /**
     * @returns rear axle X position in BB space
     */
    this.rearAxle = function () {
        return -Math.sqrt(this.chainstayLength * this.chainstayLength - this.bbDrop * this.bbDrop);
    }
    /**
     * @returns front axle X position in BB space
     */
    this.frontAxle = function () {
        return this.forkOffset() / Math.sin(deg2rad(this.headTubeAngle)) +
            (this.headTubeLength + this.forkLength() - this.forkOffset() * Math.tan(deg2rad(90 - this.headTubeAngle))) * Math.cos(deg2rad(this.headTubeAngle)) +
            this.reach();
    }
    /**
     * @returns wheelbase of bike
     */
    this.wheelbase = function () {
        return (this.frontAxle() - this.rearAxle());
    }

    this.frontCenter = function () {
        return Math.sqrt(this.bbDrop ** 2 + this.frontAxle() ** 2);
    }
    this.rearCenter = function () {
        return Math.sqrt(this.chainstayLength ** 2 - this.bbDrop ** 2);
    }

    this.reach = function () {
        return this.topTubeLength - this.stack() * Math.tan(deg2rad(90 - this.seatTubeAngle));
    }
    this.reachWithSpacers = function () {
        return this.reach() - this.spacers * Math.cos(deg2rad(this.headTubeAngle));
    }
    this.reachWithStem = function () {
        // convert stem angle to XY space
        const stemAngleAct = deg2rad(90 - this.headTubeAngle + this.stemAngle);
        return this.reachWithSpacers() + this.stemLength * Math.cos(stemAngleAct);
    }

    this.stack = function () {
        return Math.sin(deg2rad(this.headTubeAngle)) * (this.headTubeLength + this.forkLength() - this.forkOffset() * Math.cos(deg2rad(this.headTubeAngle))) + this.bbDrop;
    }
    this.stackWithSpacers = function () {
        return this.stack() + this.spacers * Math.sin(deg2rad(this.headTubeAngle));
    }
    this.stackWithStem = function () {
        // convert stem angle to XY space
        const stemAngleAct = deg2rad(90 - this.headTubeAngle + this.stemAngle);
        return this.stackWithSpacers() - this.stemLength * Math.sin(-stemAngleAct);
    }

    this.mechanicalTrail = function () {
        return this.wheelAndTireRadius() * Math.cos(deg2rad(this.headTubeAngle)) - this.forkOffset();
    }
    this.groundTrail = function () {
        return this.mechanicalTrail() / Math.sin(deg2rad(this.headTubeAngle));
    }
    this.rearWheelTrail = function () {
        return this.wheelbase() * Math.sin(deg2rad(this.headTubeAngle)) + this.mechanicalTrail();
    }
    this.steeringTrail = function() {
        throw 'Not implemented!';
    }
    /**
     * The angle at which the handlebar precedes the front axle
     */
    this.effectiveSafeDecentAngle = function() {
        const axleReach = this.frontAxle() - this.reachWithStem();
        const axleStack = this.stackWithStem() - this.bbDrop;

        return rad2deg(Math.atan2(axleReach, axleStack));
    }

    this.wheelAndTireRadius = function () {
        return (this.wheelSize + this.tireSize) / 2;
    }
    this.toeOverlap = function () {
        const minSafeDistance = this.crankLength + this.wheelAndTireRadius();
        return Math.max(0, minSafeDistance - magnitude(this.frontAxle() - this.toeLength, this.bbDrop));
    }

    this.optimizedDesign = function() {
        // TODO - Decide on the parameters
        return
    }

    this.defaultValues();
}
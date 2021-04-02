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

const RotationLocations = {
    REARAXLE: "rear_axle",
    BB: "BB",
}

// class handling all the math surrounding bikes
function BikeGeometry () {

    this.defaultValues = function() {
        this.wheelSize = 622;
        this.tireSize = 25;
        this.bbDrop = 69;
        this.fork = new Fork();
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


    /**
     * The functions which are used to calculate frame rotation. All return [X, Y] vector format
     */
    this.rearAxleToBB = function () {
        return math.matrix([Math.sqrt(this.chainstayLength*this.chainstayLength - this.bbDrop*this.bbDrop),
                -this.bbDrop]);
    }
    this.BBToUpperHeadset = function() {
        return math.matrix([this.reach(), this.stack()]);
    }
    this.upperHeadsetToSeatPost = function() {
        return math.matrix([-this.topTubeLength, 0]);
    }
    this.upperHeadsetToLowerHeadset = function() {
        return math.matrix([this.headTubeLength*Math.cos(deg2rad(this.headTubeAngle)), -this.headTubeLength*Math.sin(deg2rad(this.headTubeAngle))]);
    }
    this.lowerHeadsetToFrontAxle = function() {
        return math.matrix([this.forkLength()*Math.cos(deg2rad(this.headTubeAngle)) + this.forkOffset()*Math.sin(deg2rad(this.headTubeAngle)),
                           -this.forkLength()*Math.sin(deg2rad(this.headTubeAngle)) + this.forkOffset()*Math.cos(deg2rad(this.headTubeAngle))]);
    }
    this.rearAxleToSeatPost = function () {
        const RA_UHS = this.rearAxleToUpperHeadset();
        const UHS_SP = this.upperHeadsetToSeatPost();

        return math.add(RA_UHS, UHS_SP);
    }
    this.rearAxleToLowerHeadset = function() {
        const RA_BB = this.rearAxleToBB();
        const BB_UHS = this.BBToUpperHeadset();
        const UHS_LHS = this.upperHeadsetToLowerHeadset();

        return math.add(RA_BB, BB_UHS, UHS_LHS);
    }
    this.rearAxleToUpperHeadset = function() {
        const RA_BB = this.rearAxleToBB();
        const BB_UHS = this.BBToUpperHeadset();

        return math.add(RA_BB, BB_UHS);
    }
    this.rearAxleToFrontAxle = function() {
        const RA_LHS = this.rearAxleToLowerHeadset();
        const LHS_FA = this.lowerHeadsetToFrontAxle();

        return math.add(RA_LHS, LHS_FA);
    }

    /**
     * Rotate the frame about the specified point.
     * @param angle rotation angle in degrees.
     * @returns frame geometry in a rotated configuration
     */
    this.rotateFrame = function(angle = 0.0, location = RotationLocations.REARAXLE) {
        let rotate = math.rotationMatrix(angle * math.PI / 180.0);
        switch (location) {
            case RotationLocations.REARAXLE:
                let RA_BB  = math.multiply(rotate, this.rearAxleToBB());
                let RA_SP  = math.multiply(rotate, this.rearAxleToSeatPost());
                let RA_LHS = math.multiply(rotate, this.rearAxleToLowerHeadset());
                let RA_UHS = math.multiply(rotate, this.rearAxleToUpperHeadset());
                let RA_FA  = math.multiply(rotate, this.rearAxleToFrontAxle());

                return {
                    RA_BB: RA_BB,
                    RA_SP: RA_SP,
                    RA_LHS: RA_LHS,
                    RA_UHS: RA_UHS,
                    RA_FA: RA_FA
                };

            default:
                throw Error("Unsupported rotation location")
        }
    }

    /**
     * Take the given frame rotation, and assign back to the driving parameters
     * @param angle
     */
    this.assignRotation = function(angle = 0.0) {
        let rotated = this.rotateFrame(angle);
        this.topTubeLength = rotated.RA_UHS[0] - rotated.RA_SP[0];
        this.bbDrop = Math.abs(rotated.RA_BB[1]);
        // this.chainstayLength stays the same
        // this.headTubeLength stays the same
        let UHS_LHS = math.sub(rotated.RA_UHS,rotated.RA_LHS);
        let BB_SP = math.sub(rotated.RA_BB, rotated.RA_SP);
        this.headTubeAngle = rad2deg(math.abs(math.atan2(UHS_LHS[0], UHS_LHS[1])));
        this.seatTubeAngle = 180 - rad2deg(math.atan2(BB_SP[0], BB_SP[1]));
    }

    this.defaultValues();
}

function Derivative(fcn, x0, delta = 0.0001) {
    return (-0.5*fcn(x0-delta) + 0.5*fcn(x0+delta));
}

function NewtonRaphson(fcn, x0, epsilon = 0.001) {
    let y0 = 100*epsilon;
    while (math.abs(y0) > epsilon) {
        y0 = fcn(x0);
        let yp0 = Derivative(fcn,x0);
        x0 = x0 - y0 / yp0;
    }
    return x0;
}
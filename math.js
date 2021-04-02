

function bisectionSearch(fcn, lowX, highX, delta=0.001) {
    while (Math.abs(highX - lowX) < delta) {
        let searchX = (highX - lowX) / 2.0;
        let searchY = fcn(searchX);
        if (searchY > 0) {
            highX = searchX;
        } else if (searchY < 0) {
            lowX = searchX;
        } else {
            return searchX;
        }
    }
    return (highX - lowX)/2.0;
}

function vectorAdd(vector1, vector2) {
    if (arguments.length > 2) {
        return vectorAdd(vector1, arguments.slice(1));
    }
    else if (arguments.length === 2) {
        let sumVector = []; sumVector.length = vector1.length;
        for (let ij = 0; ij < sumVector.length; ij++)
            sumVector[ij] = vector1[ij] + vector2[ij];
        return sumVector;
    } else {
        return vector1;
    }
}

function rotationMatrix(angle_deg) {
    const angle_rad = angle_deg * Math.PI / 180.0;
    return [[Math.cos(angle_rad), -Math.sin(angle_rad)],
            [Math.sin(angle_rad), Math.cos(angle_rad)]];
}

function matrixVectorMultiply(matrix, vector) {
    return [matrix[0][0]*vector[0] + matrix[0][1] * vector[1],
            matrix[1][0]*vector[0] + matrix[1][1] * vector[1]];
}
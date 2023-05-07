import * as earcut from "earcut"

const triangulatePolygon = polygon => {

	// Flatten

	const data = earcut.flatten( polygon.geometry.coordinates )

	// Triangulate

	return earcut( data.vertices, data.holes, data.dimensions )
}

const convertTo3DMercator = ( position = [ 0, 0 ], centerOfMass = [ 0, 0 ], elevation = 0, scale = 6_378_137 ) => {

	const x = ( 0 - ( scale * ( centerOfMass[ 0 ] % 360 * ( Math.PI / 180 ) ) * 1 ) ) + scale * ( ( position[ 0 ] * ( Math.PI / 180 ) ) * 1 )
	const y = ( 0 - ( 0 - scale * ( Math.log( Math.tan( ( ( Math.PI / 2 ) + ( centerOfMass[ 1 ] % 360 * ( Math.PI / 180 ) ) ) / 2 ) ) ) * - 1 ) ) - scale * ( ( Math.log( Math.tan( ( ( Math.PI / 2 ) + ( position[ 1 ] * ( Math.PI / 180 ) ) ) / 2 ) ) ) * - 1 )

	return [ x, y, elevation ]
}

export {
	triangulatePolygon,
	convertTo3DMercator,
}

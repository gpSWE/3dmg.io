import * as earcut from "earcut"

const triangulatePolygon = polygon => {

	// Flatten

	const data = earcut.flatten( polygon.geometry.coordinates )

	// Triangulate

	return earcut( data.vertices, data.holes, data.dimensions )
}

export {
	triangulatePolygon,
}

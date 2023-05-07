import * as earcut from "earcut"
import {
	Vector3,
	Box3,
} from "three"

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

const generateUV = ( vertices, uComponent = 0, vComponent = 1 ) => {

	const points = []

	for ( let i = 0; i < vertices.length; i += 3 ) {

		points.push( new Vector3( vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] ) )
	}

	const box3 = new Box3().setFromPoints( points )
	const size = new Vector3()
	box3.getSize( size )

	const uv = []
	const v3 = new Vector3()

	for ( let i = 0; i < points.length; i++ ) {

		const u = ( points[ i ].getComponent( uComponent ) - box3.min.getComponent( uComponent ) ) / size.getComponent( uComponent )
		const v = ( points[ i ].getComponent( vComponent ) - box3.min.getComponent( vComponent ) ) / size.getComponent( vComponent )

		uv.push( u, v )
	}

	return uv
}

export {
	triangulatePolygon,
	convertTo3DMercator,
	generateUV,
}

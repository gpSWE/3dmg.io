import * as THREE from "three"

const buildPlane = (
		width,
		height,
		widthSegments,
		heightSegments,
		A,
		B,
	) => {

	const width_half = width / 2
	const height_half = height / 2

	const gridX = Math.floor( widthSegments )
	const gridY = Math.floor( heightSegments )

	const gridX1 = gridX + 1
	const gridY1 = gridY + 1

	const segment_width = width / gridX
	const segment_height = height / gridY

	//

	const indices = []
	const vertices = []
	const normals = []
	const uvs = []

	const line = new THREE.Line3( A, B )

	const WX = 1 / widthSegments
	const WY = 1 / heightSegments

	for ( let iy = 0; iy <= 1; iy += WY ) {

		const z = line.at( iy, new THREE.Vector3() ).z

		for ( let ix = 0; ix <= 1; ix += WX ) {

			const x = line.at( ix, new THREE.Vector3() ).x

			const y = iy * height

			console.log( iy )

			vertices.push( x, - y, z )

			normals.push( 0, 0, 1 )

			uvs.push( ix / gridX )
			uvs.push( 1 - ( iy / gridY ) )
		}

		console.log( "----" )
	}

	console.log( "#########################" )

	for ( let iy = 0; iy < gridY1; iy ++ ) {

		const y = iy * segment_height - height_half

		for ( let ix = 0; ix < gridX1; ix ++ ) {

			// console.log( ix, segment_width )

			// const x = ix * segment_width - width_half

			// console.log( iy, gridY )

			// vertices.push( x, - y, 0 )

			// normals.push( 0, 0, 1 )

			// uvs.push( ix / gridX )
			// uvs.push( 1 - ( iy / gridY ) )
		}
	}

	for ( let iy = 0; iy < gridY; iy ++ ) {

		for ( let ix = 0; ix < gridX; ix ++ ) {

			const a = ix + gridX1 * iy
			const b = ix + gridX1 * ( iy + 1 )
			const c = ( ix + 1 ) + gridX1 * ( iy + 1 )
			const d = ( ix + 1 ) + gridX1 * iy

			indices.push( a, b, d )
			indices.push( b, c, d )
		}
	}

	const geometry = new THREE.BufferGeometry()

	geometry.setIndex( indices )
	geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
	geometry.setAttribute( "normal", new THREE.Float32BufferAttribute( normals, 3 ) )
	geometry.setAttribute( "uv", new THREE.Float32BufferAttribute( uvs, 2 ) )

	return geometry
}

export {
	buildPlane,
}

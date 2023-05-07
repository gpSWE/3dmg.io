import * as earcut from "earcut"
import {
	Vector3,
	Box3,
	BufferGeometry,
	BufferAttribute,
	Float32BufferAttribute,
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

const createPlaneGeometry = ( polygon, centerOfMass = [], options = { elevation: 0, uv: true, normal: true } ) => {

	const coordinates = polygon.geometry.coordinates.flat()

	const vertices = []

	for ( const position of coordinates ) {

		vertices.push( ...convertTo3DMercator( position, centerOfMass, options.elevation ) )
	}

	const triangles = triangulatePolygon( polygon )

	const geometry = new BufferGeometry()

	geometry.setIndex( triangles )
	geometry.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) )

	if ( options.uv ) {

		geometry.setAttribute( "uv", new Float32BufferAttribute( generateUV( vertices ), 2 ) )
	}
	
	if ( options.normal ) {

		geometry.computeVertexNormals()
	}

	return geometry
}

const createBoxGeometry = ( polygon, centerOfMass = [], options = { face: 0, elevation: 0, uv: true, normal: true } ) => {

	const coordinates = polygon.geometry.coordinates

	const data = earcut.flatten( coordinates )
	const triangles = earcut( data.vertices, data.holes, data.dimensions )

	const flat = coordinates.flat()
	const vertices = []

	for ( const position of flat ) {

		vertices.push( ...convertTo3DMercator( position, centerOfMass, options.elevation ) )
	}

	const BASE = new BufferGeometry().setIndex( triangles )
	BASE.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) )

	if ( options.uv ) {

		BASE.setAttribute( "uv", new Float32BufferAttribute( generateUV( vertices ), 2 ) )
	}

	const geometries = [ BASE ]

	const countOfVertices = data.vertices.length / 2
	const countOfContours = data.holes[ 0 ] || countOfVertices

	// EXTERIOR SIDES

	for ( let i = 0; i < countOfContours - 1; i++ ) {

		const a = new Vector3().fromBufferAttribute( BASE.attributes.position, i )
		const b = new Vector3().fromBufferAttribute( BASE.attributes.position, i + 1 )

		const c = b.clone().setComponent( 2, options.elevation + options.height )
		const d = a.clone().setComponent( 2, options.elevation + options.height )

		const EXTERIOR = new BufferGeometry().setIndex( options.face === 0 ? [ 1, 0, 3, 3, 2, 1 ] : [ 2, 3, 0, 0, 1, 2 ] )

		const vertices = [ ...d, ...c, ...b, ...a ]

		if ( options.uv ) {

			EXTERIOR.setAttribute( "uv", new Float32BufferAttribute( generateUV( vertices, 0, 2 ), 2 ) )
		}

		EXTERIOR.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) )

		geometries.push( EXTERIOR )
	}

	// WALLS

	if ( options.thickness > 0 ) {

		for ( let i = 0; i < countOfContours - 1; i++ ) {

			const a = new Vector3().fromBufferAttribute( BASE.attributes.position, i )
			const b = new Vector3().fromBufferAttribute( BASE.attributes.position, i + 1 )

			a.setLength( a.length() - options.thickness )
			b.setLength( b.length() - options.thickness )

			const c = b.clone().setComponent( 2, options.elevation + options.height )
			const d = a.clone().setComponent( 2, options.elevation + options.height )

			const WALL = new BufferGeometry().setIndex( options.faceWall === 0 ? [ 1, 0, 3, 3, 2, 1 ] : [ 2, 3, 0, 0, 1, 2 ] )

			const vertices = [ ...a, ...b, ...c, ...d ]

			if ( options.uv ) {

				WALL.setAttribute( "uv", new Float32BufferAttribute( generateUV( vertices, 0, 2 ), 2 ) )
			}

			WALL.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) )

			geometries.push( WALL )
		}
	}

	// INTERIOR SIDES

	if ( data.holes.length ) {

		const holes = structuredClone( data.holes )

		holes.push( countOfVertices )

		for ( let h = 0; h < holes.length - 1; h++ ) {

			for ( let i = holes[ h ]; i < holes[ h + 1 ] - 1; i++ ) {

				const a = new Vector3().fromBufferAttribute( BASE.attributes.position, i )
				const b = new Vector3().fromBufferAttribute( BASE.attributes.position, i + 1 )

				const c = b.clone().setComponent( 2, options.elevation + options.height )
				const d = a.clone().setComponent( 2, options.elevation + options.height )

				const INTERIOR = new BufferGeometry().setIndex( options.face === 1 ? [ 1, 0, 3, 3, 2, 1 ] : [ 2, 3, 0, 0, 1, 2 ] )

				const vertices = [ ...a, ...b, ...c, ...d ]

				if ( options.uv ) {

					INTERIOR.setAttribute( "uv", new Float32BufferAttribute( generateUV( vertices, 0, 2 ), 2 ) )
				}

				INTERIOR.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) )

				geometries.push( INTERIOR )
			}
		}
	}

	// TOP

	if ( options.top === false && options.thickness > 0 ) {

		const contours = []

		for ( let i = 0; i < coordinates[ 0 ].length; i++ ) {

			contours.push( [ vertices[ vertices, i * 3 ], vertices[ vertices, i * 3 + 1 ] ] )
		}

		const interior = []

		for ( const position of contours ) {

			const v3 = new Vector3( ...position, 0 )

			v3.setLength( v3.length() - options.thickness )

			interior.push( [ v3.x, v3.y ] )
		}

		const currentCoordinates = [ contours, interior ]

		const data = earcut.flatten( currentCoordinates )
		const triangles = earcut( data.vertices, data.holes, data.dimensions )

		const flat = currentCoordinates.flat()

		const currentVertices = []

		for ( const position of flat ) {

			currentVertices.push( ...position, options.height )
		}

		const TOP = new BufferGeometry().setIndex( triangles )
		
		TOP.setAttribute( "position", new Float32BufferAttribute( currentVertices, 3 ) )

		if ( options.uv ) {

			TOP.setAttribute( "uv", new Float32BufferAttribute( generateUV( currentVertices ), 2 ) )
		}

		geometries.push( TOP )
	}
	else if ( options.top ) {

		const vertices = []

		for ( let i = 0; i < BASE.attributes.position.count; i++ ) {

			vertices.push( ...new Vector3().fromBufferAttribute( BASE.attributes.position, i ).setComponent( 2, options.elevation + options.height ) )
		}

		const TOP = new BufferGeometry().setIndex( triangles )

		if ( options.uv ) {

			TOP.setAttribute( "uv", BASE.attributes.uv.clone() )
		}

		TOP.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) )

		geometries.push( TOP )
	}

	const geometry = mergeGeometries( geometries, true )

	if ( options.normal ) {

		geometry.computeVertexNormals()
	}

	return geometry
}

const mergeAttributes = attributes => {

	let TypedArray
	let itemSize
	let normalized
	let arrayLength = 0

	for ( let i = 0; i < attributes.length; ++ i ) {

		const attribute = attributes[ i ]

		TypedArray = attribute.array.constructor
		itemSize = attribute.itemSize
		normalized = attribute.normalized

		arrayLength += attribute.array.length
	}

	const array = new TypedArray( arrayLength )

	let offset = 0

	for ( let i = 0; i < attributes.length; ++ i ) {

		array.set( attributes[ i ].array, offset )

		offset += attributes[ i ].array.length
	}

	return new BufferAttribute( array, itemSize, normalized )
}

const mergeGeometries = ( geometries, useGroups = false ) => {

	const attributes = {}
	const mergedGeometry = new BufferGeometry()

	let offset = 0

	for ( let i = 0; i < geometries.length; ++ i ) {

		const geometry = geometries[ i ]
		let attributesCount = 0

		for ( const name in geometry.attributes ) {

			if ( attributes[ name ] === undefined ) attributes[ name ] = []

			attributes[ name ].push( geometry.attributes[ name ] )

			attributesCount ++
		}
	}

	// merge indices

	let indexOffset = 0
	const mergedIndex = []

	for ( let i = 0; i < geometries.length; ++ i ) {

		const index = geometries[ i ].index

		for ( let j = 0; j < index.count; ++ j ) {

			mergedIndex.push( index.getX( j ) + indexOffset )
		}

		indexOffset += geometries[ i ].attributes.position.count
	}

	mergedGeometry.setIndex( mergedIndex )

	// merge attributes

	for ( const name in attributes ) {

		const mergedAttribute = mergeAttributes( attributes[ name ] )

		if ( ! mergedAttribute ) {

			console.error( "error" )
			return null
		}

		mergedGeometry.setAttribute( name, mergedAttribute )
	}

	return mergedGeometry
}

export {
	triangulatePolygon,
	convertTo3DMercator,
	generateUV,
	createPlaneGeometry,
	createBoxGeometry,
}

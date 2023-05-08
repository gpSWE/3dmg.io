import {
	BufferGeometry,
	Float32BufferAttribute,
	Uint8BufferAttribute,
	Vector3,
	Box3,
	Color,
} from "three"

import {
	polygon,
	centerOfMass
} from "@turf/turf"

import { flatten } from "earcut"

import {
	convertTo3DMercator,
	mergeGeometries,
} from "./utils"

import { default as triangulate } from "earcut"

class Extruder {

	constructor( feature ) {

		if ( feature.type ) {

			this.feature = feature
		}
	}

	createExteriorPlane( params ) {

		// TODO

		if ( !this.feature || this.feature.type !== "Polygon" ) {

			return null
		}

		params = this.#createParams( params )

		const vertices = []

		for ( const position of this.feature.exterior ) {

			const v3 = new Vector3( ...convertTo3DMercator( position, params.centerOfMass, params.elevation, params.scale ) )

			v3.setLength( v3.length() + params.length )

			if ( params.side === 0 ) {

				vertices.push( ...v3 )
			}
			else if ( params.side === 1 ) {

				vertices.unshift( ...v3 )
			}
		}

		const data = flatten( [ this.feature.exterior ] )

		const indices = triangulate( data.vertices, data.holes, data.dimensions )

		const geometry = new BufferGeometry()

		geometry.setIndex( indices )
		geometry.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) )

		if ( params.attributes.uv ) {

			geometry.setAttribute( "uv", new Float32BufferAttribute( this.#generateUV( vertices ), 2 ) )
		}

		if ( params.attributes.normal ) {

			geometry.computeVertexNormals()
		}

		return geometry
	}

	createExteriorSides( params ) {

		// TODO

		if ( !this.feature || this.feature.type !== "Polygon" ) {

			return null
		}

		params = this.#createParams( params )

		const base = this.createExteriorPlane( {
			...params,
			attributes: {
				uv: false,
				normal: false,
				elevation: 0,
			}
		} )

		const geometries = []

		for ( let i = 0; i < this.feature.exterior.length - 1; i++ ) {

			const a = new Vector3().fromBufferAttribute( base.attributes.position, i )
			const b = new Vector3().fromBufferAttribute( base.attributes.position, i + 1 )

			const c = b.clone().setComponent( 2, params.elevation + params.height )
			const d = a.clone().setComponent( 2, params.elevation + params.height )

			const side = new BufferGeometry().setIndex( [ 1, 0, 3, 3, 2, 1 ] )

			const vertices = [ ...d, ...c, ...b, ...a ]

			if ( params.attributes.uv ) {

				side.setAttribute( "uv", new Float32BufferAttribute( this.#generateUV( vertices, 0, 2 ), 2 ) )
			}

			side.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) )

			geometries.push( side )
		}

		const geometry = mergeGeometries( geometries, true )

		if ( params.attributes.normal ) {

			geometry.computeVertexNormals()
		}

		return geometry

		// const vertices = []

		// for ( const position of this.feature.exterior ) {

		// 	const v3 = new Vector3( ...convertTo3DMercator( position, params.centerOfMass, params.elevation, params.scale ) )

		// 	v3.setLength( v3.length() + params.length )

		// 	if ( params.side === 0 ) {

		// 		vertices.push( ...v3 )
		// 	}
		// 	else if ( params.side === 1 ) {

		// 		vertices.unshift( ...v3 )
		// 	}
		// }

		// const data = flatten( [ this.feature.exterior ] )

		// const indices = triangulate( data.vertices, data.holes, data.dimensions )

		// const geometry = new BufferGeometry()

		// geometry.setIndex( indices )
		// geometry.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) )

		// if ( params.attributes.uv ) {

		// 	geometry.setAttribute( "uv", new Float32BufferAttribute( this.#generateUV( vertices ), 2 ) )
		// }

		// if ( params.attributes.normal ) {

		// 	geometry.computeVertexNormals()
		// }

		// return geometry
	}

	createInteriorPlane( params ) {

		// TODO

		if ( !this.feature || this.feature.type !== "Polygon" ) {

			return null
		}

		if ( !this.feature.interior.length ) {

			console.warn( "No interior shapes" )

			return new BufferGeometry()
		}

		params = this.#createParams( params )

		const geometries = []

		for ( const coordinates of this.feature.interior ) {
			
			const vertices = []

			for ( const position of coordinates ) {

				const v3 = new Vector3( ...convertTo3DMercator( position, params.centerOfMass, params.elevation, params.scale ) )

				v3.setLength( v3.length() + params.length )

				if ( params.side === 0 ) {

					vertices.push( ...v3 )
				}
				else if ( params.side === 1 ) {

					vertices.unshift( ...v3 )
				}
			}

			const data = flatten( [ coordinates ] )

			const indices = triangulate( data.vertices, data.holes, data.dimensions )

			const geometry = new BufferGeometry()
			
			geometry.setIndex( indices )
			geometry.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) )

			if ( params.attributes.uv ) {

				geometry.setAttribute( "uv", new Float32BufferAttribute( this.#generateUV( vertices ), 2 ) )
			}

			geometries.push( geometry )
		}

		if ( geometries.length === 1 ) {

			if ( params.attributes.normal ) {

				geometries[ 0 ].computeVertexNormals()
			}

			return geometries[ 0 ]
		}

		const geometry = mergeGeometries( geometries, true )

		if ( params.attributes.normal ) {

			geometry.computeVertexNormals()
		}

		return geometry
	}

	// TODO

	extrude( params ) {

		return

		// TODO

		if ( !this.feature || this.feature.type !== "Polygon" ) {

			return null
		}

		params = this.#createParams( params )

		const coordinates = this.feature.coordinates.flat()

		const vertices = []

		for ( const position of coordinates ) {

			const v3 = new Vector3( ...convertTo3DMercator( position, params.centerOfMass, 0, params.scale ) )

			v3.setLength( v3.length() + params.length ).setComponent( 2, params.elevation )

			if ( params.side === 0 ) {

				vertices.push( ...v3 )
			}
			else if ( params.side === 1 ) {

				vertices.unshift( ...v3 )
			}
		}

		const indices = triangulate( this.feature.earcut.vertices, this.feature.earcut.holes, this.feature.earcut.dimensions )

		const geometry = new BufferGeometry()

		geometry.setIndex( indices )
		geometry.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) )

		if ( params.attributes.uv ) {

			geometry.setAttribute( "uv", new Float32BufferAttribute( this.#generateUV( vertices ), 2 ) )
		}

		if ( params.attributes.normal ) {

			geometry.computeVertexNormals()
		}

		if ( params.attributes.color ) {

			const count = geometry.attributes.position.count

			const colors = []

			for ( let i = 0; i < count; i++ ) {

				colors.push( ...params.color )
			}

			geometry.setAttribute( "color", new Uint8BufferAttribute( new Uint8Array( colors ), 3 ) )
		}

		return geometry
	}

	#createParams( params ) {

		params = params || {}

		if ( !params.centerOfMass ) {

			if ( this.feature.type === "Polygon" ) {

				params.centerOfMass = centerOfMass( polygon( this.feature.coordinates ) ).geometry.coordinates
			}
			else {
				params.centerOfMass = [ 1, 1 ]
			}
		}

		params.scale = params.scale || 6_378_137 // Radius of the Earth
		params.elevation = params.elevation || 0
		params.height = params.height || 0
		params.side = params.side || 0
		params.length = params.length || 0

		params.attributes = params.attributes || {}
		params.attributes.uv = params.attributes.uv || false
		params.attributes.normal = params.attributes.normal || false

		return params
	}

	#generateUV( vertices, uComponent = 0, vComponent = 1 ) {

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
}

export {
	Extruder,
}

import {
	BufferGeometry,
	Float32BufferAttribute,
	Vector3,
	Box3,
} from "three"

import {
	polygon,
	centerOfMass
} from "@turf/turf"

import {
	convertTo3DMercator
} from "./utils"

import { default as triangulate } from "earcut"

class Extruder {

	#baseVertices = null
	#baseIndices = null

	constructor( feature ) {

		if ( feature.type ) {

			this.feature = feature
		}
	}

	extrude( params ) {

		if ( !this.feature ) {

			return null
		}

		if ( this.feature.type === "Polygon" ) {

			params = this.#createParams( params )

			const coordinates = this.feature.coordinates.flat()

			const vertices = []

			for ( const position of coordinates ) {

				vertices.push( ...convertTo3DMercator( position, params.centerOfMass, params.elevation, params.scale ) )
			}

			if ( this.#baseVertices === null ) {

				this.#baseVertices = vertices
			}

			const indices = triangulate( this.feature.earcut.vertices, this.feature.earcut.holes, this.feature.earcut.dimensions )

			if ( this.#baseIndices === null ) {

				this.#baseIndices = indices
			}

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

		return null
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

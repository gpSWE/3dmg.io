import "./main.css"
import * as THREE from "three"
import * as earcut from "earcut"
import * as turf from "@turf/turf"
import * as utils from "./utils"
import { setup } from "./setup"
import geojson from "./custom"
import { Polygon } from "./Polygon"
import { Extruder } from "./Extruder"

const generateUV = ( vertices, uComponent = 0, vComponent = 1 ) => {

	const points = []

	for ( let i = 0; i < vertices.length; i += 3 ) {

		points.push( new THREE.Vector3( vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] ) )
	}

	const box3 = new THREE.Box3().setFromPoints( points )
	const size = new THREE.Vector3()
	box3.getSize( size )

	const uv = []
	const v3 = new THREE.Vector3()

	for ( let i = 0; i < points.length; i++ ) {

		const u = ( points[ i ].getComponent( uComponent ) - box3.min.getComponent( uComponent ) ) / size.getComponent( uComponent )
		const v = ( points[ i ].getComponent( vComponent ) - box3.min.getComponent( vComponent ) ) / size.getComponent( vComponent )

		uv.push( u, v )
	}

	return uv
}

const createBase = ( coordinates, params ) => {

	// Projection

	if ( typeof coordinates[ 0 ][ 0 ] === "number" ) {

		coordinates = [ coordinates ]
	}

	const vertices = []

	for ( const position of coordinates.flat() ) {

		const v3 = new THREE.Vector3( ...utils.convertTo3DMercator( position, params.centerOfMass, params.elevation, params.scale ) )

		v3.setLength( v3.length() + params.length ).setComponent( 2, params.elevation )

		if ( params.side === 0 ) {

			vertices.push( ...v3 )
		}
		else if ( params.side === 1 ) {

			vertices.unshift( ...v3 )
		}
	}

	// Triangulation

	const data = earcut.flatten( coordinates )

	const indices = earcut( data.vertices, data.holes, data.dimensions )

	// Create BufferGeometry

	const geometry = new THREE.BufferGeometry()

	geometry.setIndex( indices )
	geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )

	if ( params.attributes.uv ) {

		geometry.setAttribute( "uv", new THREE.Float32BufferAttribute( generateUV( vertices ), 2 ) )
	}

	if ( params.attributes.normal ) {

		geometry.computeVertexNormals()
	}

	return geometry
}

const extrude = ( coordinates, params ) => {

	// Projection

	if ( !coordinates ) {

		return null
	}

	if ( typeof coordinates[ 0 ][ 0 ] === "number" ) {

		coordinates = [ coordinates ]
	}

	const geometries = []

	for ( const contours of coordinates ) {

		const base = createBase( contours, {
			centerOfMass: params.centerOfMass,
			scale: params.scale,
			side: params.side,
			elevation: params.elevation,
			length: params.length,
			attributes: {
				uv: false,
				normal: false,
			}
		} )

		const isClockWise = turf.booleanClockwise( turf.lineString( contours ) )

		for ( let i = 0; i < contours.length; i++ ) {

			const A = new THREE.Vector3().fromBufferAttribute( base.attributes.position, i )
			const B = new THREE.Vector3().fromBufferAttribute( base.attributes.position, ( i + 1 ) % contours.length )

			const C = B.clone().setComponent( 2, B.z + params.height )
			const D = A.clone().setComponent( 2, A.z + params.height )

			const side = new THREE.BufferGeometry().setIndex( [ 1, 0, 3, 3, 2, 1 ] )

			// const vertices = isClockWise ? [ ...A, ...B, ...C, ...D ] : [ ...D, ...C, ...B, ...A ]
			const vertices = [ ...A, ...B, ...C, ...D ]

			if ( params.attributes.uv ) {

				side.setAttribute( "uv", new THREE.Float32BufferAttribute( [
					0, 0,
					1, 0,
					1, 1,
					0, 1,
				], 2 ) )
			}

			side.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )

			geometries.push( side )
		}
	}

	const geometry = utils.mergeGeometries( geometries, true )

	if ( params.attributes.normal ) {

		geometry.computeVertexNormals()
	}

	return geometry
}

const main = () => {

	const { scene, camera, renderer } = setup()

	const texture1 = new THREE.TextureLoader().load( "/156-comp-1024x1024.jpg" )

	const polyIndex = 0

	const coordinates = geojson.features[ polyIndex ].geometry.coordinates

	const centerOfMass = turf.centerOfMass( geojson.features[ polyIndex ] ).geometry.coordinates
	const scale = 6_378_137

	// BOTTOM

	{
		const geometry = createBase( coordinates, {
			centerOfMass: centerOfMass,
			scale: scale,
			side: 0,
			elevation: 30,
			length: 10,
			attributes: {
				uv: true,
				normal: true,
			}
		} )

		const material = new THREE.MeshBasicMaterial( { map: texture1, color: 0xffff00 } )

		scene.add( new THREE.Mesh( geometry, material ) )
	}

	// EXTRUDE

	{
		const geometry = extrude( coordinates, {
			centerOfMass: centerOfMass,
			scale: scale,
			side: 0,
			elevation: 0,
			length: 10,
			height: 30,
			thickness: 0,
			attributes: {
				uv: true,
				normal: true,
			}
		} )

		const material = new THREE.MeshBasicMaterial( { map: texture1 } )

		scene.add( new THREE.Mesh( geometry, material ) )
	}
}

main()

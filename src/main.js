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

const extude = ( coordinates, params ) => {

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

const main = () => {

	const { scene, camera, renderer } = setup()

	const texture1 = new THREE.TextureLoader().load( "/156-comp-1024x1024.jpg" )

	const polyIndex = 2

	const coordinates = geojson.features[ polyIndex ].geometry.coordinates

	const centerOfMass = turf.centerOfMass( geojson.features[ polyIndex ] ).geometry.coordinates
	const scale = 6_378_137

	{
		const geometry = extude( coordinates[ 0 ], {
			centerOfMass: centerOfMass,
			scale: scale,
			side: 0,
			elevation: -50,
			height: 0,
			length: 0,
			thickness: 0,
			fill: true,
			attributes: {
				uv: true,
				normal: true,
			}
		} )

		const material = new THREE.MeshBasicMaterial( { map: texture1, color: 0xff0000 } )

		scene.add( new THREE.Mesh( geometry, material ) )
	}

	{
		const geometry = extude( coordinates, {
			centerOfMass: centerOfMass,
			scale: scale,
			side: 0,
			elevation: 0,
			height: 0,
			length: 0,
			thickness: 0,
			fill: true,
			attributes: {
				uv: true,
				normal: true,
			}
		} )

		const material = new THREE.MeshBasicMaterial( { map: texture1, color: 0x00ff00 } )

		scene.add( new THREE.Mesh( geometry, material ) )
	}

	{
		const geometry = extude( coordinates[ 1 ], {
			centerOfMass: centerOfMass,
			scale: scale,
			side: 0,
			elevation: 50,
			height: 0,
			length: 0,
			thickness: 0,
			fill: true,
			attributes: {
				uv: true,
				normal: true,
			}
		} )

		const material = new THREE.MeshBasicMaterial( { map: texture1, color: 0x0000ff } )

		scene.add( new THREE.Mesh( geometry, material ) )
	}

	{
		const geometry = extude( coordinates[ 2 ], {
			centerOfMass: centerOfMass,
			scale: scale,
			side: 0,
			elevation: 50,
			height: 0,
			length: 0,
			thickness: 0,
			fill: true,
			attributes: {
				uv: true,
				normal: true,
			}
		} )

		const material = new THREE.MeshBasicMaterial( { map: texture1, color: 0x0000ff } )

		scene.add( new THREE.Mesh( geometry, material ) )
	}

	{
		const geometry = extude( coordinates, {
			centerOfMass: centerOfMass,
			scale: scale,
			side: 0,
			elevation: 100,
			height: 0,
			length: -100,
			thickness: 0,
			fill: true,
			attributes: {
				uv: true,
				normal: true,
			}
		} )

		const material = new THREE.MeshBasicMaterial( { map: texture1, color: 0x00ffff } )

		scene.add( new THREE.Mesh( geometry, material ) )
	}

	/*
		// Basic Plane

		const geometry = extude( coordinates, {
			centerOfMass: centerOfMass,
			scale: scale,
			side: 0,
			elevation: 10,
			height: 0,
			length: 0,
			thickness: 0,
			fill: true,
			attributes: {
				uv: true,
				normal: true,
			}
		} )

		const material = new THREE.MeshBasicMaterial( { map: texture1 } )

		scene.add( new THREE.Mesh( geometry, material ) )
	*/

	/*const texture1 = new THREE.TextureLoader().load( "/156-comp-1024x1024.jpg" )
	const texture2 = new THREE.TextureLoader().load( "/0524-1024x1024.jpg" )
	const texture3 = new THREE.TextureLoader().load( "/159-compr-1024x1024.jpg" )

	try {

		console.log( geojson.features[ 0 ].geometry )

		const polygon = new Polygon( geojson.features[ 2 ] )

		const extuder = new Extruder( polygon )

		{
			const geometry = extuder.createExteriorPlane( {
				elevation: 0,
				// length: 100,
				attributes: {
					uv: true,
					normal: true,
				},
			} )

			const material = new THREE.MeshStandardMaterial( {
				metalness: 0,
				roughness: 1,
				map: texture1,
				// side: 2,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}

		{
			const geometry = extuder.createInteriorPlane( {
				elevation: 10,
				// length: 100,
				attributes: {
					uv: true,
					normal: true,
				},
			} )

			const material = new THREE.MeshStandardMaterial( {
				metalness: 0,
				roughness: 1,
				map: texture1,
				// side: 2,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}

		{
			const geometry = extuder.createExteriorSides( {
				elevation: 0,
				height: 15,
				// side: 1,
				length: 0,
				thickness: 10,
				attributes: {
					uv: true,
					normal: true,
				},
			} )

			const material = new THREE.MeshStandardMaterial( {
				metalness: 0,
				roughness: 1,
				map: texture1,
				// side: 2,
			} )

			// scene.add( new THREE.Mesh( geometry, material ) )
		}
	}
	catch( e ) {

		console.warn( e )
	}*/
}

main()

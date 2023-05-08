import "./main.css"
import * as THREE from "three"
import { setup } from "./setup"
import geojson from "./geojson"
import { Polygon } from "./Polygon"
import { Extruder } from "./Extruder"

const main = () => {

	const { scene, camera, renderer } = setup()

	const texture1 = new THREE.TextureLoader().load( "/156-comp-1024x1024.jpg" )
	const texture2 = new THREE.TextureLoader().load( "/0524-1024x1024.jpg" )
	const texture3 = new THREE.TextureLoader().load( "/159-compr-1024x1024.jpg" )

	try {

		const polygon = new Polygon( geojson.features[ 1 ] )

		const extuder = new Extruder( polygon )

		{
			const geometry = extuder.createExteriorPlane( {
				elevation: 15,
				length: 100,
				// thickness: 6,
				// // top: false,
				// bottom: true,
				attributes: {
					uv: true,
					normal: true,
				},
			} )

			const material = new THREE.MeshStandardMaterial( {
				metalness: 0,
				roughness: 1,
				map: texture1,
				side: 2,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}

		{
			const geometry = extuder.createExteriorSides( {
				elevation: 0,
				height: 15,
				side: 0,
				length: -2,
				thickness: 6,
				// top: false,
				bottom: true,
				attributes: {
					uv: true,
					normal: true,
				},
			} )

			const material = new THREE.MeshStandardMaterial( {
				metalness: 0,
				roughness: 1,
				map: texture1,
				side: 2,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}
	}
	catch( e ) {

		console.warn( e )
	}
}

main()

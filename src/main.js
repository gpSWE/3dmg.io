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

		const polygon = new Polygon( geojson.features[ 4 ] )

		const extuder = new Extruder( polygon )

		{
			const geometry = extuder.createExteriorPlane( {
				elevation: 0,
				side: 0,
				length: 0,
				attributes: {
					uv: true,
					normal: true,
				},
			} )

			const material = new THREE.MeshStandardMaterial( {
				metalness: 0.5,
				roughness: 0.75,
				map: texture2,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}

		{
			const geometry = extuder.createExteriorSides( {
				elevation: -80,
				height: 80,
				side: 0,
				length: 0,
				attributes: {
					uv: true,
					normal: true,
				},
			} )

			const material = new THREE.MeshStandardMaterial( {
				metalness: 0,
				roughness: 1,
				map: texture3,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}

		{
			const geometry = extuder.createExteriorSides( {
				elevation: 0,
				height: 100,
				side: 0,
				length: -10,
				attributes: {
					uv: true,
					normal: true,
				},
			} )

			const material = new THREE.MeshStandardMaterial( {
				metalness: 0,
				roughness: 1,
				map: texture1,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}
	}
	catch( e ) {

		console.warn( e )
	}
}

main()

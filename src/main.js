import "./main.css"
import * as THREE from "three"
import { setup } from "./setup"
import geojson from "./geojson"
import { Polygon } from "./Polygon"
import { Extruder } from "./Extruder"

const main = () => {

	const { scene, camera, renderer } = setup()

	const texture = new THREE.TextureLoader().load( "/156-comp-1024x1024.jpg" )

	try {

		const polygon = new Polygon( geojson.features[ 0 ] )

		const extuder = new Extruder( polygon )

		// BOTTOM

		{
			const geometry = extuder.extrude( {
				attributes: {
					// uv: true,
					normal: true,
					color: true,
				},
				color: new THREE.Color( 0xffff00 ),
			} )

			const material = new THREE.MeshStandardMaterial( {
				// map: texture,
				metalness: 0.5,
				roughness: 0.75,
				vertexColors: true,
				// color: 0x000000,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}

		// TOP

		{
			const geometry = extuder.extrude( {
				attributes: {
					uv: true,
					normal: true,
				},
				elevation: 50,
				side: 1,
			} )

			const material = new THREE.MeshStandardMaterial( {
				map: texture,
				metalness: 0.5,
				roughness: 0.75,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}
	}
	catch( e ) {

		console.warn( e )
	}
}

main()

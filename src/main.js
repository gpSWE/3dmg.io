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

		for ( let i = 0; i < 10; i++ ) {

			const geometry = extuder.extrude( {
				attributes: {
					uv: true,
					normal: true,
				},
				elevation: i * 20,
				length: -i * 10
			} )

			const material = new THREE.MeshStandardMaterial( {
				map: texture,
				metalness: 0.5,
				roughness: 0.75,
				color: Math.random() * 0xffffff,
				side: 2,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}

		// TOP
	}
	catch( e ) {

		console.warn( e )
	}
}

main()

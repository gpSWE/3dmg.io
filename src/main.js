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
				map: texture,
				metalness: 0.5,
				roughness: 0.75,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}

		{
			const geometry = extuder.createInteriorPlane( {
				elevation: 10,
				side: 0,
				length: 0,
				attributes: {
					uv: true,
					normal: true,
				},
			} )

			const material = new THREE.MeshStandardMaterial( {
				map: texture,
				metalness: 0.5,
				roughness: 0.75,
				color: 0x0000ff,
			} )

			scene.add( new THREE.Mesh( geometry, material ) )
		}
	}
	catch( e ) {

		console.warn( e )
	}
}

main()

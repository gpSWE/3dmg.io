import "./main.css"
import * as THREE from "three"
import * as utils from "./utils"
import { OrbitControls } from "three/addons/controls/OrbitControls"
import { setup } from "./setup"
import geojson from "./geojson"
import * as turf from "@turf/turf"
import { Polygon } from "./Polygon"
import { Extruder } from "./Extruder"

const main = () => {

	const { scene, camera, renderer } = setup()

	new OrbitControls( camera, renderer.domElement )

	//

	const polygon = new Polygon( geojson.features[ 0 ] )

	const extuder = new Extruder( polygon )

	//

	const texture = new THREE.TextureLoader().load( "/156-comp-1024x1024.jpg" )

	{
		const geometry = extuder.extrude( {
			attributes: {
				uv: true,
				normal: true,
			}
		} )
		const material = new THREE.MeshStandardMaterial( {
			map: texture,
			metalness: 0.5,
			roughness: 0.75,
		} )
		const mesh = new THREE.Mesh( geometry, material )
		scene.add( mesh )
	}
}

main()

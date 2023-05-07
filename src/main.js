import "./main.css"
import * as THREE from "three"
import * as utils from "./utils"
import { OrbitControls } from "three/addons/controls/OrbitControls"
import { setup } from "./setup"
import geojson from "./geojson"

const main = () => {

	const { scene, camera, renderer } = setup()

	new OrbitControls( camera, renderer.domElement )

	scene.add( new THREE.AxesHelper( 1000 ) )

	//

	const polygon = geojson.features[ 0 ]
	const centerOfMass = polygon.properties.centerOfMass
	const elevation = 0

	// BASE

	{
		const geometry = utils.createPlaneGeometry( polygon, centerOfMass, elevation )

		const material = new THREE.MeshBasicMaterial( {
			map: new THREE.TextureLoader().load( "/uvcheck.jpg" ),
		} )

		const mesh = new THREE.Mesh( geometry, material )

		scene.add( mesh )
	}
}

main()

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

	const polygon = geojson.features[ 3 ]
	const centerOfMass = polygon.properties.centerOfMass

	{
		// PlaneGeometry

		// const geometry = utils.createPlaneGeometry( polygon, centerOfMass )
		// const material = new THREE.MeshBasicMaterial( { color: 0x4361ee } )
		// const mesh = new THREE.Mesh( geometry, material )
		// scene.add( mesh )
	}

	{
		// BoxGeometry

		const geometry = utils.createBoxGeometry( polygon, centerOfMass, {
			elevation: 0,
			height: 50,
			face: 0,
			faceWall: 0,
			normal: true,
			uv: true,
			thickness: 5,
			top: false,
		} )

		console.log( geometry.attributes.position.count )

		const texture = new THREE.TextureLoader().load( "/uvcheck.jpg" )

		const material = new THREE.MeshBasicMaterial( {
			map: texture,
			side: 2,
			opacity: 1,
			transparent: true,
		} )
		const mesh = new THREE.Mesh( geometry, material )
		scene.add( mesh )
	}
}

main()

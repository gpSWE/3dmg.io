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

	const polygon = geojson.features[ 4 ]
	const centerOfMass = polygon.properties.centerOfMass

	{
		// BoxGeometry

		const geometry = utils.createBoxGeometry( polygon, centerOfMass, {
			elevation: 0,
			height: 100,
			face: 0,
			faceWall: 0,
			normal: true,
			uv: true,
			exteriorThickness: 10,
			exteriorTop: true,
			interiorTop: false,
		} )

		console.log( "Count of vertices:", geometry.attributes.position.count )

		const texture = new THREE.TextureLoader().load( "/uvcheck.jpg" )

		const material = new THREE.MeshBasicMaterial( {
			map: texture,
			side: 2,
			opacity: 0.5,
			transparent: true,
			wireframe: false,
		} )
		const mesh = new THREE.Mesh( geometry, material )
		scene.add( mesh )
	}
}

main()

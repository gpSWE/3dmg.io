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

	const triangles = utils.triangulatePolygon( geojson.features[ 0 ] )

	console.log( triangles )
}

main()

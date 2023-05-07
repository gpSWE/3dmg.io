import "./main.css"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls"
import { setup } from "./setup"

const main = () => {

	const { scene, camera, renderer } = setup()

	new OrbitControls( camera, renderer.domElement )

	scene.add( new THREE.AxesHelper( 1000 ) )
}

main()

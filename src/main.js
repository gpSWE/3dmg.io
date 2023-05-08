import "./main.css"
import * as THREE from "three"
import * as utils from "./utils"
import { OrbitControls } from "three/addons/controls/OrbitControls"
import { setup } from "./setup"
import geojson from "./geojson"
import * as turf from "@turf/turf"

const main = () => {

	const { scene, camera, renderer } = setup()

	new OrbitControls( camera, renderer.domElement )

	scene.add( new THREE.AxesHelper( 1000 ) )

	{
		const light = new THREE.DirectionalLight( 0xffffff, 0.5 )
		light.position.set( 50, 50, 50 )
		scene.add( light )
	}

	{
		const light = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 )
		light.position.set( 50, 50, 100 )
		scene.add( light )
	}

	{
		const light = new THREE.AmbientLight( 0xffffff, 0.25 )
		light.position.set( 50, 50, 100 )
		scene.add( light )
	}

	//

	const polygon = geojson.features[ 5 ]
	const smoothPolygon = turf.polygonSmooth( geojson.features[ 5 ], { interactions: 100 } )
	const centerOfMass = polygon.properties.centerOfMass

	{
		// BoxGeometry

		const geometry = utils.createBoxGeometry( smoothPolygon.features[ 0 ], centerOfMass, {
			elevation: 0,
			height: 1000,
			face: 0,
			faceWall: 0,
			normal: true,
			uv: true,
			base: false,
			exteriorThickness: 0,
			exteriorTop: false,
			interiorTop: true,
		} )

		console.log( "Count of vertices:", geometry.attributes.position.count )

		const texture = new THREE.TextureLoader().load( "/212-comp-1024x997.png" )

		texture.wrapT = texture.wrapS = THREE.RepeatWrapping
		texture.repeat.set( 2, 2 )
		texture.anisotropy = renderer.capabilities.getMaxAnisotropy()

		const material = new THREE.MeshStandardMaterial( {
			alphaMap: texture,
			metalness: 1,
			roughness: 0,
			color: 0x000000,
			side: 2,
			transparent: true,
			wireframe: false,
		} )
		const mesh = new THREE.Mesh( geometry, material )
		scene.add( mesh )
	}
}

main()

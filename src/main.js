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
	const coordinates = polygon.geometry.coordinates.flat()
	const centerOfMas = polygon.properties.centerOfMass
	const elevation = 0

	const vertices = []

	for ( const position of coordinates ) {

		vertices.push( ...utils.convertTo3DMercator( position, centerOfMas, elevation ) )
	}

	const triangles = utils.triangulatePolygon( polygon )

	{
		const geometry = new THREE.BufferGeometry()

		geometry.setIndex( triangles )
		geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
		geometry.setAttribute( "uv", new THREE.Float32BufferAttribute( utils.generateUV( vertices ), 2 ) )

		geometry.computeVertexNormals()

		const material = new THREE.MeshBasicMaterial( {
			map: new THREE.TextureLoader().load( "/uvcheck.jpg" ),
		} )

		const mesh = new THREE.Mesh( geometry, material )

		scene.add( mesh )
	}
}

main()

import "./main.css"
import * as THREE from "three"
import { setup } from "./setup"
import { buildPlane } from "./buildPlane"

const { scene, renderer } = setup()

scene.add( new THREE.GridHelper( 4, 4, 0x606060, 0x303030 ) )

const map = new THREE.TextureLoader().load( "uvcheck.jpg" )
// const map = new THREE.TextureLoader().load( "0518-3-1024x1024.jpg" )
map.colorSpace = THREE.SRGBColorSpace
map.anisotropy = renderer.capabilities.getMaxAnisotropy()
map.wrapS = map.wrapT = THREE.RepeatWrapping
// map.repeat.set( 4, 1 )

const A = new THREE.Vector3( 0, 0, 0 )
const B = new THREE.Vector3( 1, 0, 1 )

const geometry = buildPlane( 1, 1, 2, 1, A, B )
const material = new THREE.MeshBasicMaterial( {
	// wireframe: true,
	map,
} )
const mesh = new THREE.Mesh( geometry, material )
scene.add( mesh )

// {
// 	const geometry = buildPlane( 1, 1, 2, 1, A, B )
// 	const material = new THREE.PointsMaterial( { size: 0.1 } )
// 	const mesh = new THREE.Points( geometry, material )
// 	scene.add( mesh )
// }

const l3 = new THREE.Line3( A, B )

const C = l3.at( 1 / 2, new THREE.Vector3() )

const vertices = [
	[ ...A ],
	[ ...B ],
	[ ...C ],
]

{
	const geometry = new THREE.BufferGeometry()
	geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices.flat(), 3 ) )
	const material = new THREE.PointsMaterial( { size: 0.25 } )
	const mesh = new THREE.Points( geometry, material )
	// scene.add( mesh )
}

import "./main.css"
import * as earcut from "earcut"
import * as THREE from "three"
import { setup } from "./setup"

const exterior = [

	// counterclockwise

	// [ 40, 55, 0 ],
	// [ 10, 40, 0 ],
	// [ 10, 10, 0 ],
	// [ 40, 20, 0 ],
	// [ 70, 10, 0 ],
	// [ 70, 40, 0 ],

	// [ 40, 55, 0 ],

	[ 0, 0, 0 ], // 0
	[ 1, 0, 0 ], // 1
	[ 2, 0, 0 ], // 2
	[ 2, 1, 0 ], // 3
	[ 1, 1, 0 ], // 4
	[ 0, 1, 0 ], // 5
]

// [ 2, 3, 0, 0, 1, 2 ]

// [ 4, 5, 0, 1, 2, 3, 3, 4, 0, 0, 1, 3 ]

const hole = [

	// clockwise

	[ 40, 25, 0 ],
	[ 30, 30, 0 ],
	[ 30, 40, 0 ],
	[ 50, 40, 0 ],
	[ 50, 30, 0 ],

	[ 40, 25, 0 ],
]

const coordinates = [ exterior ]

const data = earcut.flatten( coordinates )
const indices = earcut( data.vertices, data.holes, data.dimensions )
const vertices = coordinates.flat( 2 )

console.log( indices )

// 2, 3, 0, 0, 1, 2

console.log( "100% correct:", earcut.deviation( data.vertices, data.holes, data.dimensions, indices ) )

//

const { scene } = setup()

// Base geometry

const base = new THREE.BufferGeometry()

base.setIndex( indices )
base.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
base.computeVertexNormals()

//

const material = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
const mesh = new THREE.Mesh( base, material )
scene.add( mesh )

{
	const material = new THREE.PointsMaterial( { color: 0x0000ff, size: 0.25 } )
	const mesh = new THREE.Points( base, material )
	scene.add( mesh )
}

// Exturde exterior

// {
// 	const height = 50

// 	const A = []
// 	const B = []
// 	const C = []

// 	for ( let i = 0; i < exterior.length - 1; i++ ) {

// 		A.push( [ i, 0 ] )
// 		B.unshift( [ i, 1 ] )

// 		C.unshift( [ exterior[ i ][ 0 ], exterior[ i ][ 1 ], 10 ] )
// 	}

// 	console.log( [ ...A, ...B ] )

// 	const coordinates = [ [ ...A, ...B ] ]

// 	const data = earcut.flatten( coordinates )
// 	const indices = earcut( data.vertices, data.holes, data.dimensions )
// 	const vertices = [ ...C, ...exterior ].flat()

// 	console.log( vertices )

// 	const extrude = new THREE.BufferGeometry()

// 	extrude.setIndex( indices )
// 	extrude.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
// 	extrude.computeVertexNormals()

// 	const material = new THREE.MeshNormalMaterial()
// 	const mesh = new THREE.Mesh( extrude, material )
// 	scene.add( mesh )
// }
